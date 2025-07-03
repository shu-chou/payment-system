import { Container } from 'inversify';
import { TYPES } from '../types/types';
import { IPaymentService } from '../interfaces/payment-service.interface';
import { PaymentService } from '../services/payment.service';
import { redis } from '../providers/redis.provider';
import { logger } from '../providers/logger.provider';
import { IPaymentProvider } from '../interfaces/payment-provider.interface';
import { FlakyPaymentProvider } from '../providers/flaky-payment.provider';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { SummaryService } from '../services/summary.service';
import { MetricsService } from '../services/metrics.service';

const container = new Container();

container.bind<IPaymentService>(TYPES.IPaymentService).to(PaymentService);
container.bind(TYPES.RedisClient).toConstantValue(redis);
container.bind(TYPES.Logger).toConstantValue(logger);
container.bind<IPaymentProvider>(TYPES.PaymentProvider).to(FlakyPaymentProvider);
container.bind(TYPES.CircuitBreakerService).to(CircuitBreakerService);
container.bind(TYPES.SummaryService).to(SummaryService);
container.bind(TYPES.MetricsService).to(MetricsService);

export { container }; 