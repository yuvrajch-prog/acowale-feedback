import React from 'react';
import { StatusType, CategoryType } from '../types';

export const StatusBadge: React.FC<{ status: StatusType }> = ({ status }) => {
  const styles: Record<StatusType, { bg: string; text: string; dot: string; label: string }> = {
    OPEN: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500', label: 'Open' },
    IN_PROGRESS: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', dot: 'bg-blue-500', label: 'In Progress' },
    RESOLVED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500', label: 'Resolved' },
  };

  const style = styles[status] || styles.OPEN;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {style.label}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: CategoryType }> = ({ category }) => {
  const labels: Record<CategoryType, { label: string; color: string }> = {
    BUG: { label: 'Bug Report', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    FEATURE_REQUEST: { label: 'Feature Request', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    UI: { label: 'UI & Ergonomics', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    PERFORMANCE: { label: 'Performance', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    GENERAL: { label: 'General', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  const c = labels[category] || labels.GENERAL;

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${c.color}`}>
      {c.label}
    </span>
  );
};
