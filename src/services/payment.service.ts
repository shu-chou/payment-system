import { injectable, inject } from 'inversify';
import { TYPES } from '../types/types';
import { IPaymentProvider } from '../interfaces/payment-provider.interface';
import { IPaymentService } from '../interfaces/payment-service.interface';
import { Logger } from 'pino';
import { CircuitBreakerService } from './circuit-breaker.service';
import { config } from '../configs/env.config';
import { ApiError } from '../handlers/error/error.handler';
import Redis from 'ioredis';

@injectable()
export class PaymentService implements IPaymentService {
  private readonly paymentLogKey = 'payment:attempts';
  private readonly paymentLogTTL = config.payment.logTTL; // seconds
  private readonly paymentLogMaxLength = config.payment.logMaxLength;

  constructor(
    @inject(TYPES.PaymentProvider) private paymentProvider: IPaymentProvider,
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.CircuitBreakerService) private circuitBreaker: CircuitBreakerService,
    @inject(TYPES.RedisClient) private redis: Redis
  ) {}

  private async logAttempt(result: 'success' | 'failure', retries: number) {
    const entry = JSON.stringify({ result, timestamp: Date.now(), retries });
    await this.redis.lpush(this.paymentLogKey, entry);
    await this.redis.ltrim(this.paymentLogKey, 0, this.paymentLogMaxLength - 1);
    await this.redis.expire(this.paymentLogKey, this.paymentLogTTL);
  }

  async processPayment(
    amount: number,
    currency: string,
    source: string,
    backoffTimes: number[] = config.payment.backoffMs,
    maxRetries: number = config.payment.maxRetries
  ): Promise<void> {
    // Check circuit breaker before processing
    const canProceed = await this.circuitBreaker.shouldAllowRequests();
    if (!canProceed) {
      this.logger.warn({ amount, currency, source }, 'Circuit breaker open: rejecting payment');
      throw new ApiError(503, 'Service temporarily unavailable - circuit breaker open');
    }

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        await this.paymentProvider.processPayment(amount);
        this.logger.info({ amount, currency, source, attempt: attempt + 1 }, 'Payment succeeded');
        await this.circuitBreaker.recordSuccess();
        await this.logAttempt('success', attempt + 1);
        return;
      } catch (err) {
        const error = err as Error;
        this.logger.warn({ amount, currency, source, attempt: attempt + 1, error: error.message }, 'Payment attempt failed');
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, backoffTimes[attempt]));
        }
      }
      attempt++;
    }
    this.logger.error({ amount, currency, source, reason: 'All retries failed' }, 'Payment failed');
    await this.circuitBreaker.recordFailure();
    await this.logAttempt('failure', attempt);
    throw new ApiError(502, 'Payment failed after retries');
  }
} 