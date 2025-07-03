import { injectable, inject, optional, unmanaged } from 'inversify';
import { IPaymentProvider } from '../interfaces/payment-provider.interface';
import { TYPES } from '../types/types';
import { Logger } from 'pino';
import { config } from '../configs/env.config';

@injectable()
export class FlakyPaymentProvider implements IPaymentProvider {
  private failureRate: number;
  private logger: Logger;

  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @unmanaged() failureRate?: number
  ) {
    this.logger = logger;
    this.failureRate =
      typeof failureRate === 'number'
        ? failureRate
        : Number(config.flakyPaymentFailureRate) || 0.3;
  }

  async processPayment(amount: number): Promise<boolean> {
    const shouldFail = Math.random() < this.failureRate;
    if (shouldFail) {
      this.logger.warn({ amount }, 'FlakyPaymentProvider: Payment failed');
      throw new Error('FlakyPaymentProvider: Payment failed');
    }
    this.logger.info({ amount }, 'FlakyPaymentProvider: Payment succeeded');
    return true;
  }
} 