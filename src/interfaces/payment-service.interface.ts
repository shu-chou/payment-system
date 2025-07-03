export interface IPaymentService {
  processPayment(
    amount: number,
    currency: string,
    source: string,
    backoffTimes?: number[],
    maxRetries?: number
  ): Promise<void>;
} 