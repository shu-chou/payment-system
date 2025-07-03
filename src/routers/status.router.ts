import { Router } from 'express';
import { container } from '../configs/inversify.config';
import { TYPES } from '../types/types';
import { SummaryService } from '../services/summary.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { MetricsService } from '../services/metrics.service';
import { asyncHandler } from '../handlers/global/async.handler';

const router = Router();

router.get('/status', asyncHandler(async (req, res) => {
  const circuitBreaker = container.get<CircuitBreakerService>(TYPES.CircuitBreakerService);
  const status = await circuitBreaker.getStatus();
  res.json(status);
}));
router.get('/status/summary', asyncHandler(async (req, res) => {
  const summaryService = container.get<SummaryService>(TYPES.SummaryService);
  const summary = await summaryService.generateSummary();
  res.json(summary);
}));



export default router; 