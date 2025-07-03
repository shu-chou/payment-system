import { Request, Response, NextFunction } from 'express';
import { container } from '../configs/inversify.config';
import { TYPES } from '../types/types';
import { PaymentService } from '../services/payment.service';

export class PaymentController {
  static async pay(req: Request, res: Response, next: NextFunction) {
    const paymentService = container.get<PaymentService>(TYPES.IPaymentService);
    const { amount, currency, source } = req.body;
    await paymentService.processPayment(amount, currency, source);
    return res.status(200).json({ message: 'Payment succeeded' });
  }
} 