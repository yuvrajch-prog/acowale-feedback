import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

export const submissionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 submissions per 15 mins to prevent spam
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Feedback submission limit exceeded. Please wait a few minutes before submitting again.',
      code: 'SUBMISSION_LIMIT_EXCEEDED',
    },
  },
});
