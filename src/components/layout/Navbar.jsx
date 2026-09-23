'use client';

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username || 'Admin User';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/75 backdrop-blur-xl border-b border-slate-800/70 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: App Brand & Badges */}
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow-[0_0_20px_rgba(99,102,241,0.45)] group-hover:scale-105 transition-transform duration-200">
                S
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                  Stock<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Room</span>
                </span>
              </div>
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Inventory
            </div>
          </div>

          {/* Right: User Profile & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800/80">
              <div className="relative">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={displayName}
                    className="w-9 h-9 rounded-full ring-2 ring-indigo-500/40 object-cover shadow-sm bg-slate-800"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm ring-2 ring-indigo-500/40">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-white leading-tight">
                  {displayName}
                </p>
                <p className="text-[11px] font-medium text-slate-400">
                  @{user?.username || 'admin'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-rose-400 bg-slate-900/90 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 shadow-sm"
              title="Sign out of StockRoom"
            >
              <svg
                className="w-4 h-4 text-slate-400 group-hover:text-rose-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
