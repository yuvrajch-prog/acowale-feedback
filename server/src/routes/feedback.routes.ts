import { Router } from 'express';
import {
  createFeedbackHandler,
  listFeedbackHandler,
  updateFeedbackStatusHandler,
} from '../controllers/feedback.controller';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createFeedbackSchema,
  updateFeedbackStatusSchema,
  listFeedbackQuerySchema,
} from '../types';
import { submissionRateLimiter } from '../middleware/rateLimiter';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();

// PUBLIC Endpoint: Anyone can submit feedback!
router.post(
  '/',
  submissionRateLimiter,
  validateBody(createFeedbackSchema),
  createFeedbackHandler
);

// ADMIN Protected Endpoints: Require admin authentication token
router.get(
  '/',
  requireAdminAuth,
  validateQuery(listFeedbackQuerySchema),
  listFeedbackHandler
);

router.patch(
  '/:id',
  requireAdminAuth,
  validateBody(updateFeedbackStatusSchema),
  updateFeedbackStatusHandler
);

export default router;
