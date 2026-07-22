import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let prisma: PrismaClient;

try {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);

  prisma = new PrismaClient({
    adapter,
    log: ['warn', 'error'],
  });
} catch (err) {
  logger.error('Failed to initialize Prisma Client', err);
  throw err;
}

export { prisma };
