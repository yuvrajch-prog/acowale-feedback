import { z } from 'zod';

export const CategoryEnum = z.enum([
  'BUG',
  'FEATURE_REQUEST',
  'UI',
  'PERFORMANCE',
  'GENERAL',
]);

export const StatusEnum = z.enum([
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
]);

export type CategoryType = z.infer<typeof CategoryEnum>;
export type StatusType = z.infer<typeof StatusEnum>;

export const createFeedbackSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Please provide a valid email address'),
  category: CategoryEnum.default('GENERAL'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5').default(5),
  comment: z.string().min(5, 'Feedback comment must be at least 5 characters').max(2000, 'Comment is too long'),
});

export const updateFeedbackStatusSchema = z.object({
  status: StatusEnum,
});

export const listFeedbackQuerySchema = z.object({
  category: CategoryEnum.optional(),
  status: StatusEnum.optional(),
  search: z.string().optional(),
  rating: z.string().transform((val) => parseInt(val, 10)).optional(),
  page: z.string().transform((val) => parseInt(val, 10)).default('1'),
  limit: z.string().transform((val) => parseInt(val, 10)).default('10'),
  sortBy: z.enum(['createdAt', 'rating', 'category', 'status']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const analyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  category: CategoryType;
  rating: number;
  comment: string;
  status: StatusType;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}
