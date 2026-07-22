import { prisma } from './client';
import { logger } from '../utils/logger';

const seedAdmin = {
  email: 'admin@acowale.com',
  name: 'Acowale Lead Admin',
  password: 'admin123', // In production, hashed with bcrypt
  role: 'ADMIN' as const,
};

const seedFeedbackData = [
  {
    name: 'Sarah Jenkins',
    email: 'sarah.j@acowale.com',
    category: 'UI',
    rating: 5,
    comment: 'The dashboard navigation is incredibly intuitive! Loving the new analytics cards layout.',
    status: 'RESOLVED',
  },
  {
    name: 'Alex Rivera',
    email: 'alex.rivera@techcorp.io',
    category: 'FEATURE_REQUEST',
    rating: 4,
    comment: 'Can we get automated CSV export scheduling for weekly reporting?',
    status: 'IN_PROGRESS',
  },
  {
    name: 'Michael Chen',
    email: 'm.chen@enterprise.org',
    category: 'BUG',
    rating: 2,
    comment: 'Filtering by date range produces a 2-second lag on large datasets.',
    status: 'OPEN',
  },
  {
    name: 'Elena Rostova',
    email: 'elena@designhub.co',
    category: 'PERFORMANCE',
    rating: 3,
    comment: 'Dark mode toggle resets upon refreshing the browser session.',
    status: 'IN_PROGRESS',
  },
  {
    name: 'David Kim',
    email: 'david.k@startuplab.io',
    category: 'GENERAL',
    rating: 5,
    comment: 'Acowale CRM has simplified our customer feedback triage completely. Kudos to the team!',
    status: 'RESOLVED',
  },
];

async function seed() {
  logger.info('Starting database seeding...');
  try {
    // Seed Admin User
    await prisma.user.upsert({
      where: { email: seedAdmin.email },
      update: {},
      create: seedAdmin,
    });
    logger.info('✅ Admin user created/verified in User table');

    // Seed Feedback Submissions
    for (const item of seedFeedbackData) {
      await prisma.feedback.create({
        data: item as any,
      });
    }
    logger.info('✅ Feedback submissions seeded successfully');
  } catch (error) {
    logger.warn('Prisma seed warning (continuing with fallback data handling if DB uninitialized):', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
