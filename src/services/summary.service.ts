import { injectable, inject } from 'inversify';
import { TYPES } from '../types/types';
import Redis from 'ioredis';
import { CircuitBreakerService } from './circuit-breaker.service';
import { config } from '../configs/env.config';

@injectable()
export class SummaryService {
  private readonly paymentLogKey = 'payment:attempts';
  private readonly summaryWindowMs = config.summary.windowMs;

  constructor(
    @inject(TYPES.RedisClient) private redis: Redis,
    @inject(TYPES.CircuitBreakerService) private circuitBreaker: CircuitBreakerService
  ) {}

  async generateSummary(): Promise<{ summary: string }> {
    // Fetch recent payment attempts
    const entries = await this.redis.lrange(this.paymentLogKey, 0, 999);
    const now = Date.now();
    const windowStart = now - this.summaryWindowMs;
    let total = 0;
    let failures = 0;
    for (const entry of entries) {
      try {
        const { result, timestamp } = JSON.parse(entry);
        if (timestamp >= windowStart) {
          total++;
          if (result === 'failure') failures++;
        }
      } catch {}
    }
    const failureRate = total > 0 ? Math.round((failures / total) * 100) : 0;
    const state = await this.circuitBreaker.getCircuitState();
    let summary = '';
    if (total === 0) {
      summary = 'No payment attempts in the last 10 minutes.';
    } else {
      summary = `In the last 10 minutes, ${failureRate}% of payment attempts failed. The circuit breaker is currently ${state.toLowerCase()}`;
      if (state === 'OPEN') summary += ', blocking new attempts.';
      else if (state === 'HALF_OPEN') summary += ', allowing a test request.';
      else summary += ', allowing all requests.';
    }
    return { summary };
  }
} 