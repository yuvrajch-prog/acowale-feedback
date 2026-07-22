import { Router } from 'express';
import { getAnalyticsSummaryHandler } from '../controllers/analytics.controller';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();

// ADMIN Protected Endpoint
router.get('/summary', requireAdminAuth, getAnalyticsSummaryHandler);

export default router;
