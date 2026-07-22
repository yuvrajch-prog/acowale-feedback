import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { FeedbackForm } from './FeedbackForm';
import { AdminDashboard } from './AdminDashboard';
import { AdminLoginModal } from './AdminLoginModal';

interface AppRoutesProps {
  adminName: string | null;
  loadingProfile: boolean;
  setAdminName: (name: string | null) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  adminName,
  loadingProfile,
  setAdminName,
  showToast,
}) => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <FeedbackForm
            onSuccessSubmit={(msg) => showToast(msg || 'Feedback submitted successfully!', 'success')}
            onError={(msg) => showToast(msg || 'An error occurred.', 'error')}
          />
        }
      />
      <Route
        path="/admin/login"
        element={
          loadingProfile ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : adminName ? (
            <Navigate to="/admin" replace />
          ) : (
            <AdminLoginModal
              onLoginSuccess={(name) => {
                setAdminName(name);
                showToast(`Successfully logged in as ${name}`, 'success');
                navigate('/admin');
              }}
            />
          )
        }
      />
      <Route
        path="/admin"
        element={
          loadingProfile ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : adminName ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
