import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import {
  Search, Download, RefreshCw, Star, MessageSquare, Filter, Layers, CheckCircle2, Clock, AlertTriangle, Edit3, Trash2, X
} from 'lucide-react';
import axios from 'axios';
import { fetchAnalyticsSummary, fetchFeedbackList, updateFeedbackStatus, deleteFeedback } from '../services/api';
import { FeedbackItem, AnalyticsSummary, StatusType } from '../types';
import { StatusBadge, CategoryBadge } from './StatusBadge';

const CATEGORY_COLORS: Record<string, string> = {
  BUG: '#e11d48',
  FEATURE_REQUEST: '#9333ea',
  UI: '#0284c7',
  PERFORMANCE: '#d97706',
  GENERAL: '#64748b',
};

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit Modal state
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [newStatus, setNewStatus] = useState<StatusType>('OPEN');
  const [updating, setUpdating] = useState(false);

  const loadAnalytics = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetchAnalyticsSummary(signal);
      if (res.success) setAnalytics(res.data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Failed to fetch analytics summary', err);
      }
    }
  }, []);

  const loadFeedback = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFeedbackList({
        search: search || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        rating: ratingFilter || undefined,
        page,
        limit: 10,
      }, signal);
      if (res.success) {
        setFeedbackList(res.data);
        setTotalPages(res.meta.totalPages);
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError('Failed to fetch dashboard data. Please verify admin session.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [search, categoryFilter, statusFilter, ratingFilter, page]);

  useEffect(() => {
    const controller = new AbortController();
    loadAnalytics(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadAnalytics]);

  useEffect(() => {
    const controller = new AbortController();
    loadFeedback(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadFeedback]);

  const handleRefresh = async () => {
    await Promise.all([loadAnalytics(), loadFeedback()]);
  };

  const handleStatusUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setUpdating(true);
    try {
      const res = await updateFeedbackStatus(selectedItem.id, newStatus);
      if (res.success) {
        setSelectedItem(null);
        loadAnalytics();
        loadFeedback();
      }
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback item? This is a soft-delete and the data will be preserved, but it will be hidden from the dashboard.')) {
      return;
    }
    try {
      const res = await deleteFeedback(id);
      if (res.success) {
        loadAnalytics();
        loadFeedback();
      }
    } catch (err) {
      alert('Failed to delete feedback item.');
    }
  };

  const handleExportCSV = () => {
    if (feedbackList.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Category', 'Rating', 'Status', 'Comment', 'Date'];
    const rows = feedbackList.map((f) => [
      f.id,
      `"${f.name.replace(/"/g, '""')}"`,
      `"${f.email}"`,
      f.category,
      f.rating,
      f.status,
      `"${f.comment.replace(/"/g, '""')}"`,
      new Date(f.createdAt).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Acowale_Feedback_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            Admin Console & Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time customer feedback insights, category breakdown, and submission triage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="pro-card rounded-xl p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Submissions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{analytics?.totalFeedback ?? '--'}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total feedback entries</p>
        </div>

        <div className="pro-card rounded-xl p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Average Rating</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {analytics?.averageRating ? `${analytics.averageRating} / 5` : '--'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Customer satisfaction score</p>
        </div>

        <div className="pro-card rounded-xl p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Open Triage</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            {analytics?.statusDistribution.find((s) => s.key === 'OPEN')?.count ?? 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting review</p>
        </div>

        <div className="pro-card rounded-xl p-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {analytics?.statusDistribution.find((s) => s.key === 'RESOLVED')?.count ?? 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Action items completed</p>
        </div>

      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Category Breakdown Bar Chart */}
        <div className="pro-card rounded-2xl p-5 bg-white border border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 mb-0.5">Category-wise Distribution</h2>
          <p className="text-xs text-slate-500 mb-4">Breakdown of feedback entries by category</p>
          <div className="h-60 w-full">
            {analytics && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {analytics.categoryDistribution.map((entry) => (
                      <Cell key={entry.key} fill={CATEGORY_COLORS[entry.key] || '#2563eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Submission Trend Area Chart */}
        <div className="pro-card rounded-2xl p-5 bg-white border border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 mb-0.5">Submission Volume Trend</h2>
          <p className="text-xs text-slate-500 mb-4">Daily submission activity over recent days</p>
          <div className="h-60 w-full">
            {analytics && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.submissionTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Filter & Search Toolbar */}
      <div className="pro-card rounded-xl p-3.5 bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">

        {/* Search */}
        <div className="relative w-full md:w-80 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, keyword..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" /> Filter:
          </span>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="">All Categories</option>
            <option value="BUG">Bug Report</option>
            <option value="FEATURE_REQUEST">Feature Request</option>
            <option value="UI">UI & Ergonomics</option>
            <option value="PERFORMANCE">Performance</option>
            <option value="GENERAL">General</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-600 font-medium"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {(search || categoryFilter || statusFilter || ratingFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('');
                setStatusFilter('');
                setRatingFilter('');
                setPage(1);
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="pro-card rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-slate-900 text-sm">Feedback Submissions</h3>
          </div>

          <div className='flex items-center gap-4'>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

          </div>

        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Comment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Loading submissions...
                  </td>
                </tr>
              ) : feedbackList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No feedback items match your search.
                  </td>
                </tr>
              ) : (
                feedbackList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-slate-500 text-[11px]">{item.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <CategoryBadge category={item.category} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <span>{item.rating}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate" title={item.comment}>
                      {item.comment}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setNewStatus(item.status);
                        }}
                        className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition border border-slate-200 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-blue-600" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        className="px-2.5 py-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1 transition border border-rose-200 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span>Total {feedbackList.length} items on page</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded-md bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-medium"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded-md bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Status Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-0.5">Update Feedback Status</h3>
            <p className="text-xs text-slate-500 mb-5">Submitted by {selectedItem.name}</p>

            <form onSubmit={handleStatusUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as StatusType)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-1/2 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-1/2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
