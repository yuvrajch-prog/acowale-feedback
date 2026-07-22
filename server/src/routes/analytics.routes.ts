import { Router } from 'express';
import { getAnalyticsSummaryHandler } from '../controllers/analytics.controller';
import { requireAdminAuth } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';
import { analyticsQuerySchema } from '../types';

const router = Router();

// ADMIN Protected Endpoint
router.get(
  '/summary',
  requireAdminAuth,
  validateQuery(analyticsQuerySchema),
  getAnalyticsSummaryHandler
);

export default router;
