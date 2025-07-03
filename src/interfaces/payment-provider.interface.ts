export interface IPaymentProvider {
  processPayment(amount: number): Promise<boolean>;
} 