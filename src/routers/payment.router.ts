import { Router } from 'express';
import { validatePaymentRequest } from '../handlers/request/payment.handler';
import { PaymentController } from '../controllers/payment.controller';
import { asyncHandler } from '../handlers/global/async.handler';

const router = Router();

// POST /pay
router.post('/pay', validatePaymentRequest, asyncHandler(PaymentController.pay));

export default router; 