import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquarePlus, LayoutDashboard, LogOut, ShieldCheck, LogIn } from 'lucide-react';

interface HeaderProps {
  adminName: string | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ adminName, onLogout }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo (Clickable to return to user feedback form) */}
          <Link
            to="/"
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-sm transition">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  acowale
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold group-hover:bg-blue-100 group-hover:text-blue-800 transition">
                  CRM
                </span>
              </div>
            </div>
          </Link>

          {/* Right Header Section */}
          <div className="flex items-center gap-3">

            {/* If NOT logged in */}
            {!adminName ? (
              !isAdminPath ? (
                <Link
                  to="/admin/login"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Admin Login
                </Link>
              ) : (
                <Link
                  to="/"
                  className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5 text-slate-500" />
                  Public Form
                </Link>
              )
            ) : (
              /* If LOGGED in */
              <div className="flex items-center gap-3">
                {!isAdminPath && (
                  <>
                    <Link
                      to="/admin"
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Admin Dashboard
                    </Link>
                    <div className="h-4 w-[1px] bg-slate-200"></div>
                  </>
                )}

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-700 font-medium">{adminName}</span>
                  <button
                    onClick={onLogout}
                    title="Log out admin session"
                    className="ml-2 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
