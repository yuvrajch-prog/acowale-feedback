import { useState, useEffect } from 'react';
import axios from 'axios';
import { Header } from './components/Header';
import { FeedbackForm } from './components/FeedbackForm';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { getAdminToken, removeAdminToken, fetchAdminProfile } from './services/api';
import { Heart, Globe, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [adminName, setAdminName] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const controller = new AbortController();
    const checkAdminAuth = async () => {
      const token = getAdminToken();
      if (token) {
        try {
          const profile = await fetchAdminProfile(controller.signal);
          if (profile.success) {
            setAdminName(profile.data.name || "Admin");
          }
        } catch (err) {
          if (!axios.isCancel(err)) {
            removeAdminToken();
            setAdminName(null);
          }
        }
      }
    };
    checkAdminAuth();
    return () => {
      controller.abort();
    };
  }, []);

  const handleLogout = () => {
    removeAdminToken(); // Clears local storage token
    setAdminName(null);
    showToast('Successfully logged out.', 'success');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-['Inter',sans-serif]">

      <div>
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          adminName={adminName}
          onLogout={handleLogout}
        />

        <main>
          {activeTab === 'user' ? (
            <FeedbackForm onSuccessSubmit={() => showToast('Feedback submitted successfully!', 'success')} />
          ) : adminName ? (
            <AdminDashboard />
          ) : (
            <AdminLoginModal
              onLoginSuccess={(name) => {
                setAdminName(name);
                showToast(`Successfully logged in as ${name}`, 'success');
              }}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>Acowale Machine Test Submission</span>
            <span className="text-blue-600 font-semibold">#TeamAcowale 🚀</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <a
              href="https://acowale.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 flex items-center gap-1 transition"
            >
              <Globe className="w-3.5 h-3.5" /> Acowale Technologies
            </a>
            <span>•</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> & Engineering precision
            </span>
          </div>
        </div>
      </footer>

      {/* Toast Notification Popup */}
      {toast && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-3 bg-white border border-slate-200 text-slate-900 px-4 py-3.5 rounded-xl shadow-lg text-xs font-semibold max-w-sm transition-all duration-300 transform translate-y-0 opacity-100 animate-slide-in">
          {toast.type === 'success' ? (
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}

export default App;
