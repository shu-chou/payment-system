import { Router } from 'express';
import { container } from '../configs/inversify.config';
import { TYPES } from '../types/types';
import { MetricsService } from '../services/metrics.service';
import { asyncHandler } from '../handlers/global/async.handler';

const router = Router();

router.get('/metrics', asyncHandler(async (req, res) => {
  const metricsService = container.get<MetricsService>(TYPES.MetricsService);
  const metrics = await metricsService.getMetrics();
  res.json(metrics);
}));

export default router; 