export type CategoryType = 'BUG' | 'FEATURE_REQUEST' | 'UI' | 'PERFORMANCE' | 'GENERAL';
export type StatusType = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  category: CategoryType;
  rating: number;
  comment: string;
  status: StatusType;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AnalyticsSummary {
  totalFeedback: number;
  averageRating: number;
  categoryDistribution: { name: string; key: CategoryType; count: number }[];
  statusDistribution: { name: string; key: StatusType; count: number }[];
  submissionTrend: { date: string; count: number }[];
}

export interface FeedbackResponse {
  success: boolean;
  data: FeedbackItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
