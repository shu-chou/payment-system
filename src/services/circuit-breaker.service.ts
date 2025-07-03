import { injectable, inject, unmanaged } from 'inversify';
import { TYPES } from '../types/types';
import { Logger } from 'pino';
import Redis from 'ioredis';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  cooldownPeriod: number; 
  circuitKey: string;
}

@injectable()
export class CircuitBreakerService {
  private readonly config: CircuitBreakerConfig;
  private readonly transitionLogKey: string;
  private readonly transitionLogMaxLength: number;

  constructor(
    @inject(TYPES.RedisClient) private redis: Redis,
    @inject(TYPES.Logger) private logger: Logger,
    @unmanaged() config?: Partial<CircuitBreakerConfig>
  ) {
    this.config = {
      failureThreshold: config?.failureThreshold || 5,
      cooldownPeriod: config?.cooldownPeriod || 30000, // 30 seconds
      circuitKey: config?.circuitKey || 'circuit:payment',
    };
    this.transitionLogKey = `${this.config.circuitKey}:transitions`;
    this.transitionLogMaxLength = 100;
  }

  async shouldAllowRequests(): Promise<boolean> {
    const state = await this.getCircuitState();
    
    if (state === 'CLOSED') {
      return true;
    }

    if (state === 'OPEN') {
      const lastFailureTime = await this.getLastFailureTime();
      const now = Date.now();
      
      if (now - lastFailureTime > this.config.cooldownPeriod) {
        // Transition to HALF_OPEN
        await this.setCircuitState('HALF_OPEN');
        this.logger.info({ circuitKey: this.config.circuitKey }, 'Circuit transitioned to HALF_OPEN');
        return true; // Allow one test request
      }
      
      return false; // Still in cooldown
    }

    // HALF_OPEN state - allow one test request
    return true;
  }

  async recordSuccess(): Promise<void> {
    await this.redis.multi()
      .del(`${this.config.circuitKey}:failures`)
      .del(`${this.config.circuitKey}:lastFailure`)
      .set(`${this.config.circuitKey}:state`, 'CLOSED')
      .exec();
    
    this.logger.info({ circuitKey: this.config.circuitKey }, 'Circuit closed after success');
  }

  async recordFailure(): Promise<void> {
    const failureCount = await this.redis.incr(`${this.config.circuitKey}:failures`);
    const now = Date.now();
    
    await this.redis.set(`${this.config.circuitKey}:lastFailure`, now);
    
    if (failureCount >= this.config.failureThreshold) {
      await this.setCircuitState('OPEN');
      this.logger.warn({ 
        circuitKey: this.config.circuitKey, 
        failureCount,
        threshold: this.config.failureThreshold 
      }, 'Circuit opened due to failure threshold');
    } else {
      this.logger.warn({ 
        circuitKey: this.config.circuitKey, 
        failureCount,
        threshold: this.config.failureThreshold 
      }, 'Failure recorded, circuit still closed');
    }
  }

  async getCircuitState(): Promise<CircuitState> {
    const state = await this.redis.get(`${this.config.circuitKey}:state`);
    return (state as CircuitState) || 'CLOSED';
  }

  private async setCircuitState(state: CircuitState): Promise<void> {
    await this.redis.set(`${this.config.circuitKey}:state`, state);
    await this.logTransition(state);
  }

  private async logTransition(state: CircuitState) {
    const entry = JSON.stringify({ state, timestamp: Date.now() });
    await this.redis.lpush(this.transitionLogKey, entry);
    await this.redis.ltrim(this.transitionLogKey, 0, this.transitionLogMaxLength - 1);
  }

  private async getLastFailureTime(): Promise<number> {
    const time = await this.redis.get(`${this.config.circuitKey}:lastFailure`);
    return time ? parseInt(time, 10) : 0;
  }

  async getStatus(): Promise<{ circuitState: CircuitState; failureCount: number; lastFailure: string | null }> {
    const circuitState = await this.getCircuitState();
    const failureCount = Number(await this.redis.get(`${this.config.circuitKey}:failures`)) || 0;
    const lastFailureRaw = await this.redis.get(`${this.config.circuitKey}:lastFailure`);
    const lastFailure = lastFailureRaw ? new Date(Number(lastFailureRaw)).toISOString() : null;
    return { circuitState, failureCount, lastFailure };
  }

  async getRecentTransitions(limit = 10): Promise<{ state: CircuitState; timestamp: string }[]> {
    const entries = await this.redis.lrange(this.transitionLogKey, 0, limit - 1);
    return entries.map(e => {
      try {
        const { state, timestamp } = JSON.parse(e);
        return { state, timestamp: new Date(Number(timestamp)).toISOString() };
      } catch {
        return { state: 'CLOSED', timestamp: '' };
      }
    });
  }
} 