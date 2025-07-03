import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { PaymentRequestDto } from '../../dtos/request/payment.dto';
import { ApiError } from '../error/error.handler';

export async function validatePaymentRequest(req: Request, res: Response, next: NextFunction) {
  const paymentDto = plainToInstance(PaymentRequestDto, req.body);
  const errors = await validate(paymentDto);
  if (errors.length > 0) {
    const details = errors.map(e => ({ property: e.property, constraints: e.constraints }));
    return next(new ApiError(400, 'Validation failed', details));
  }
  req.body = paymentDto;
  next();
} 