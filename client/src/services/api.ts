import axios from 'axios';
import { FeedbackItem, AnalyticsSummary, FeedbackResponse, CategoryType, StatusType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const getAdminToken = (): string | null => {
  return localStorage.getItem('acowale_admin_token');
};

export const setAdminToken = (token: string): void => {
  localStorage.setItem('acowale_admin_token', token);
};

export const removeAdminToken = (): void => {
  localStorage.removeItem('acowale_admin_token');
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Admin Auth Token automatically to every request if available
api.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginAdmin = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  if (res.data.success && res.data.data.token) {
    setAdminToken(res.data.data.token);
  }
  return res.data;
};

export const fetchAdminProfile = async (signal?: AbortSignal) => {
  const res = await api.get('/auth/me', { signal });
  return res.data;
};

export const submitFeedback = async (payload: {
  name: string;
  email: string;
  category: CategoryType;
  rating: number;
  comment: string;
}): Promise<{ success: boolean; data: FeedbackItem; message: string }> => {
  const res = await api.post('/feedback', payload);
  return res.data;
};

export const fetchFeedbackList = async (
  params: {
    category?: string;
    status?: string;
    search?: string;
    rating?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: string;
  },
  signal?: AbortSignal
): Promise<FeedbackResponse> => {
  const res = await api.get('/feedback', { params, signal });
  return res.data;
};

export const updateFeedbackStatus = async (
  id: string,
  status: StatusType,
  adminNote?: string
): Promise<{ success: boolean; data: FeedbackItem; message: string }> => {
  const res = await api.patch(`/feedback/${id}`, { status, adminNote });
  return res.data;
};

export const deleteFeedback = async (
  id: string
): Promise<{ success: boolean; data: FeedbackItem; message: string }> => {
  const res = await api.delete(`/feedback/${id}`);
  return res.data;
};

export const fetchAnalyticsSummary = async (
  params?: { startDate?: string; endDate?: string },
  signal?: AbortSignal
): Promise<{ success: boolean; data: AnalyticsSummary }> => {
  const res = await api.get('/analytics/summary', { params, signal });
  return res.data;
};

export const fetchHealthCheck = async (): Promise<any> => {
  const res = await api.get('/health');
  return res.data;
};
