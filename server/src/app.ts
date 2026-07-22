import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import feedbackRoutes from './routes/feedback.routes';
import analyticsRoutes from './routes/analytics.routes';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging middleware
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global API rate limiting
app.use('/api/', apiRateLimiter);

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/health', healthRoutes);

// Root Welcome Endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Acowale CRM Machine Test API',
    version: '1.0.0',
    status: 'Active',
    documentation: '/api/v1/health',
  });
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Resource not found',
      code: 'NOT_FOUND',
    },
  });
});

// Central Error Handler
app.use(errorHandler);

export default app;
