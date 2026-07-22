import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './db/client';

async function startServer() {
  logger.info('Connecting to database...');
  try {
    await prisma.$connect();
    logger.info('💾 Database connection established successfully.');
  } catch (error) {
    logger.error('❌ Failed to connect to the database:', error);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Acowale CRM Backend Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`🔗 API Base: http://localhost:${env.PORT}/api/v1`);
    logger.info(`❤️  Health Check: http://localhost:${env.PORT}/api/v1/health`);
  });

  const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down HTTP server...`);
    server.close(async () => {
      logger.info('HTTP server closed. Disconnecting database...');
      await prisma.$disconnect();
      logger.info('Database disconnected. Exiting process.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer();
