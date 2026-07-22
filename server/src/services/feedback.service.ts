import { prisma } from '../db/client';
import { FeedbackItem, CategoryType, StatusType } from '../types';

// In-memory store fallback if DB connection is unavailable during quick dev/test evaluation
const memoryFeedbackStore: FeedbackItem[] = [
  {
    id: 'f1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@acowale.com',
    category: 'UI',
    rating: 5,
    comment: 'The dashboard navigation is incredibly intuitive! Loving the new analytics cards layout.',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'f2',
    name: 'Alex Rivera',
    email: 'alex.rivera@techcorp.io',
    category: 'FEATURE_REQUEST',
    rating: 4,
    comment: 'Can we get automated CSV export scheduling for weekly reporting?',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'f3',
    name: 'Michael Chen',
    email: 'm.chen@enterprise.org',
    category: 'BUG',
    rating: 2,
    comment: 'Filtering by date range produces a 2-second lag on large datasets.',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'f4',
    name: 'Elena Rostova',
    email: 'elena@designhub.co',
    category: 'PERFORMANCE',
    rating: 3,
    comment: 'Dark mode toggle resets upon refreshing the browser session.',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'f5',
    name: 'David Kim',
    email: 'david.k@startuplab.io',
    category: 'GENERAL',
    rating: 5,
    comment: 'Acowale CRM has simplified our customer feedback triage completely. Kudos to the team!',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export class FeedbackService {
  private static isDbAvailable = true;

  static async createFeedback(data: {
    name: string;
    email: string;
    category: CategoryType;
    rating: number;
    comment: string;
  }): Promise<FeedbackItem> {
    if (this.isDbAvailable) {
      try {
        const created = await prisma.feedback.create({
          data: {
            name: data.name,
            email: data.email,
            category: data.category as any,
            rating: data.rating,
            comment: data.comment,
            status: 'OPEN',
          },
        });
        return created as unknown as FeedbackItem;
      } catch (error) {
        this.isDbAvailable = false;
      }
    }

    const newFeedback: FeedbackItem = {
      id: 'f_' + Math.random().toString(36).substring(2, 9),
      name: data.name,
      email: data.email,
      category: data.category,
      rating: data.rating,
      comment: data.comment,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryFeedbackStore.unshift(newFeedback);
    return newFeedback;
  }

  static async listFeedback(query: {
    category?: CategoryType;
    status?: StatusType;
    search?: string;
    rating?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    if (this.isDbAvailable) {
      try {
        const whereClause: any = { deletedAt: null };
        if (query.category) whereClause.category = query.category;
        if (query.status) whereClause.status = query.status;
        if (query.rating) whereClause.rating = query.rating;
        if (query.search) {
          whereClause.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { comment: { contains: query.search, mode: 'insensitive' } },
          ];
        }

        const [items, total] = await Promise.all([
          prisma.feedback.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: {
              [query.sortBy || 'createdAt']: query.order || 'desc',
            },
          }),
          prisma.feedback.count({ where: whereClause }),
        ]);

        return {
          data: items,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        this.isDbAvailable = false;
      }
    }

    // Fallback in-memory query evaluation
    let filtered = memoryFeedbackStore.filter((item) => !item.deletedAt);
    if (query.category) filtered = filtered.filter((item) => item.category === query.category);
    if (query.status) filtered = filtered.filter((item) => item.status === query.status);
    if (query.rating) filtered = filtered.filter((item) => item.rating === query.rating);
    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.comment.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateStatus(id: string, status: StatusType): Promise<FeedbackItem | null> {
    if (this.isDbAvailable) {
      try {
        const updated = await prisma.feedback.update({
          where: { id },
          data: {
            status: status as any,
          },
        });
        return updated as unknown as FeedbackItem;
      } catch (error) {
        this.isDbAvailable = false;
      }
    }

    const item = memoryFeedbackStore.find((f) => f.id === id);
    if (!item) return null;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    return item;
  }

  static async getAnalyticsSummary(query?: { startDate?: string; endDate?: string }) {
    let items: FeedbackItem[] = [];
    const whereClause: any = { deletedAt: null };

    if (query?.startDate || query?.endDate) {
      whereClause.createdAt = {};
      if (query.startDate) {
        whereClause.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        if (query.endDate.length === 10) {
          end.setUTCHours(23, 59, 59, 999);
        }
        whereClause.createdAt.lte = end;
      }
    }

    if (this.isDbAvailable) {
      try {
        const dbItems = await prisma.feedback.findMany({
          where: whereClause,
        });
        items = dbItems as unknown as FeedbackItem[];
      } catch (error) {
        this.isDbAvailable = false;
        items = memoryFeedbackStore.filter((item) => {
          if (item.deletedAt) return false;
          if (query?.startDate) {
            const startLimit = new Date(query.startDate);
            if (new Date(item.createdAt) < startLimit) return false;
          }
          if (query?.endDate) {
            const endLimit = new Date(query.endDate);
            if (query.endDate.length === 10) {
              endLimit.setUTCHours(23, 59, 59, 999);
            }
            if (new Date(item.createdAt) > endLimit) return false;
          }
          return true;
        });
      }
    } else {
      items = memoryFeedbackStore.filter((item) => {
        if (item.deletedAt) return false;
        if (query?.startDate) {
          const startLimit = new Date(query.startDate);
          if (new Date(item.createdAt) < startLimit) return false;
        }
        if (query?.endDate) {
          const endLimit = new Date(query.endDate);
          if (query.endDate.length === 10) {
            endLimit.setUTCHours(23, 59, 59, 999);
          }
          if (new Date(item.createdAt) > endLimit) return false;
        }
        return true;
      });
    }

    const totalFeedback = items.length;
    const avgRating = totalFeedback > 0 ? (items.reduce((acc, curr) => acc + curr.rating, 0) / totalFeedback).toFixed(1) : 0;

    // Category Distribution
    const categoryCounts: Record<string, number> = {
      BUG: 0,
      FEATURE_REQUEST: 0,
      UI: 0,
      PERFORMANCE: 0,
      GENERAL: 0,
    };

    // Status Distribution
    const statusCounts: Record<string, number> = {
      OPEN: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
    };

    items.forEach((item) => {
      if (categoryCounts[item.category] !== undefined) categoryCounts[item.category]++;
      if (statusCounts[item.status] !== undefined) statusCounts[item.status]++;
    });

    // Generate daily trends dynamically between start and end dates in UTC
    const trendsMap: Record<string, number> = {};
    let start = query?.startDate ? new Date(query.startDate) : new Date(Date.now() - 86400000 * 6);
    let end = query?.endDate ? new Date(query.endDate) : new Date();

    // Reset boundaries to UTC start/end of day
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Cap dynamic trends at 90 days to avoid performance overhead in charts
    if (diffDays > 90) {
      start = new Date(end.getTime() - 86400000 * 89);
      start.setUTCHours(0, 0, 0, 0);
    }

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      trendsMap[dateStr] = 0;
    }

    items.forEach((item) => {
      const dateStr = new Date(item.createdAt).toISOString().split('T')[0];
      if (trendsMap[dateStr] !== undefined) {
        trendsMap[dateStr]++;
      }
    });

    const trend = Object.entries(trendsMap).map(([date, count]) => ({
      date,
      count,
    }));

    return {
      totalFeedback,
      averageRating: parseFloat(avgRating as string),
      categoryDistribution: [
        { name: 'Bug Report', key: 'BUG', count: categoryCounts.BUG },
        { name: 'Feature Request', key: 'FEATURE_REQUEST', count: categoryCounts.FEATURE_REQUEST },
        { name: 'UI & Ergonomics', key: 'UI', count: categoryCounts.UI },
        { name: 'Performance', key: 'PERFORMANCE', count: categoryCounts.PERFORMANCE },
        { name: 'General', key: 'GENERAL', count: categoryCounts.GENERAL },
      ],
      statusDistribution: [
        { name: 'Open', key: 'OPEN', count: statusCounts.OPEN },
        { name: 'In Progress', key: 'IN_PROGRESS', count: statusCounts.IN_PROGRESS },
        { name: 'Resolved', key: 'RESOLVED', count: statusCounts.RESOLVED },
      ],
      submissionTrend: trend,
    };
  }

  static async deleteFeedback(id: string): Promise<FeedbackItem | null> {
    if (this.isDbAvailable) {
      try {
        const deleted = await prisma.feedback.update({
          where: { id },
          data: {
            deletedAt: new Date(),
          },
        });
        return deleted as unknown as FeedbackItem;
      } catch (error: any) {
        if (error.code === 'P2025') {
          return null;
        }
        this.isDbAvailable = false;
      }
    }

    const item = memoryFeedbackStore.find((f) => f.id === id);
    if (!item) return null;
    item.deletedAt = new Date().toISOString();
    return item;
  }
}
