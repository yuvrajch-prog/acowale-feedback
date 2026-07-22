import React, { useState } from 'react';
import { Star, Send, CheckCircle2, AlertCircle, MessageSquare, User, Mail, Tag } from 'lucide-react';
import { submitFeedback } from '../services/api';
import { CategoryType } from '../types';

const CATEGORIES: { key: CategoryType; label: string; description: string; icon: string }[] = [
  { key: 'BUG', label: 'Bug Report', description: 'System crashes, unexpected behavior, or errors', icon: '🐛' },
  { key: 'FEATURE_REQUEST', label: 'Feature Request', description: 'Ideas or improvements you would love to see', icon: '💡' },
  { key: 'UI', label: 'UI & Ergonomics', description: 'Design, layout, colors, or visual experience', icon: '🎨' },
  { key: 'PERFORMANCE', label: 'Performance', description: 'Speed, responsiveness, latency issues', icon: '⚡' },
  { key: 'GENERAL', label: 'General / Other', description: 'General thoughts or general platform feedback', icon: '💬' },
];

export const FeedbackForm: React.FC<{
  onSuccessSubmit?: (msg: string) => void;
  onError?: (msg: string) => void;
}> = ({ onSuccessSubmit, onError }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<CategoryType>('FEATURE_REQUEST');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedComment = comment.trim();

    if (!trimmedName || !trimmedEmail || !trimmedComment) {
      if (onError) onError('Please fill in all required fields.');
      return;
    }

    if (trimmedName.length < 2) {
      if (onError) onError('Name must be at least 2 characters.');
      return;
    }

    if (trimmedComment.length < 5) {
      if (onError) onError('Feedback comment must be at least 5 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitFeedback({
        name: trimmedName,
        email: trimmedEmail,
        category,
        rating,
        comment: trimmedComment,
      });

      if (res.success) {
        setName('');
        setEmail('');
        setComment('');
        setRating(5);
        if (onSuccessSubmit) {
          onSuccessSubmit('Thank you! Your feedback has been submitted successfully.');
        }
      }
    } catch (err: any) {
      const errorObj = err.response?.data?.error;
      let msg = errorObj?.message || 'Failed to submit feedback. Please try again.';
      
      if (Array.isArray(errorObj?.details) && errorObj.details.length > 0) {
        const detailMsgs = errorObj.details
          .map((detail: any) => `${detail.field}: ${detail.message}`)
          .join(', ');
        msg = `${msg} (${detailMsgs})`;
      }
      
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 5: return 'Exceptional 🚀';
      case 4: return 'Great experience 👍';
      case 3: return 'Average 😐';
      case 2: return 'Needs work 👎';
      case 1: return 'Poor 😠';
      default: return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">

      {/* Title Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Acowale Customer Feedback Portal
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl mx-auto">
          Share your experience or report issues. Your input helps us continuously improve our products.
        </p>
      </div>

      {/* Main White Card Form */}
      <div className="pro-card rounded-2xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm">





        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Your Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Work Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@company.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs transition"
                required
              />
            </div>
          </div>

          {/* Category Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" /> Feedback Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`p-3.5 rounded-xl cursor-pointer transition border ${category === cat.key
                    ? 'bg-blue-50/70 border-blue-600 text-blue-950 font-medium shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span>{cat.icon}</span>
                    <span className={category === cat.key ? 'text-blue-700 font-bold' : 'text-slate-800'}>
                      {cat.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 pl-6">
                    {cat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Rating <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 hover:text-slate-400'
                      }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {getRatingLabel(hoverRating || rating)}
              </span>
            </div>
          </div>

          {/* Comments */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Detailed Comments <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{comment.length} / 2000</span>
            </div>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe your feedback, issue, or feature idea..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs transition resize-none"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1">Minimum 5 characters required.</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Submitting...</span>
            ) : (
              <>
                <Send className="w-4 h-4" /> Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
