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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: App Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 hover:text-indigo-600 transition-colors">
                StockRoom
              </span>
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full border border-indigo-100">
              Admin
            </span>
          </div>

          {/* Right: User Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={displayName}
                  className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500">@{user?.username || 'admin'}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-red-50 hover:text-red-600 border border-gray-300 hover:border-red-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
              title="Sign out of StockRoom"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
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
