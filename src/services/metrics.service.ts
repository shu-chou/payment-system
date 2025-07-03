import { injectable, inject } from 'inversify';
import { TYPES } from '../types/types';
import Redis from 'ioredis';
import { CircuitBreakerService } from './circuit-breaker.service';
import { config } from '../configs/env.config';

@injectable()
export class MetricsService {
  private readonly paymentLogKey = 'payment:attempts';
  private readonly summaryWindowMs = config.summary.windowMs;

  constructor(
    @inject(TYPES.RedisClient) private redis: Redis,
    @inject(TYPES.CircuitBreakerService) private circuitBreaker: CircuitBreakerService
  ) {}

  async getMetrics() {
    // Fetch recent payment attempts
    const entries = await this.redis.lrange(this.paymentLogKey, 0, config.payment.logMaxLength - 1);
    const now = Date.now();
    const windowStart = now - this.summaryWindowMs;
    let total = 0;
    let failures = 0;
    let successes = 0;
    let totalRetries = 0;
    for (const entry of entries) {
      try {
        const { result, timestamp, retries } = JSON.parse(entry);
        if (timestamp >= windowStart) {
          total++;
          if (result === 'failure') failures++;
          if (result === 'success') successes++;
          totalRetries += retries || 0;
        }
      } catch {}
    }
    const failureRate = total > 0 ? Math.round((failures / total) * 100) : 0;
    const successRate = total > 0 ? Math.round((successes / total) * 100) : 0;
    const avgRetries = total > 0 ? (totalRetries / total) : 0;
    const transitions = await this.circuitBreaker.getRecentTransitions(10);
    return {
      retryCounts: {
        totalRetries,
        avgRetries: Number(avgRetries.toFixed(2)),
      },
      rates: {
        total,
        successes,
        failures,
        successRate,
        failureRate,
      },
      circuitTransitions: transitions,
    };
  }
} 