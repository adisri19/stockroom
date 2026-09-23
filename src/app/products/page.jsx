'use client';

import { useState, useEffect, Suspense, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import ProductTable from '../../components/products/ProductTable';
import ProductCard from '../../components/products/ProductCard';
import Pagination from '../../components/ui/Pagination';
import Loader from '../../components/ui/Loader';
import useProducts from '../../hooks/useProducts';
import useDebounce from '../../hooks/useDebounce';

function ProductListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const {
    products,
    total,
    loading,
    error,
    page,
    limit,
    q,
    category,
  } = useProducts();

  // Local state for instant input feedback, debounced by 400ms
  const [searchInput, setSearchInput] = useState(q);
  const debouncedQuery = useDebounce(searchInput, 400);

  // Sync search input if URL changes externally (e.g. back button or category selection)
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // Update URL helper function
  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  // Push debounced search query to URL as single source of truth
  useEffect(() => {
    if (debouncedQuery.trim() !== q) {
      updateUrlParams({
        q: debouncedQuery.trim() || null,
        page: 1, // Reset to page 1 on new search
      });
    }
  }, [debouncedQuery]);

  const isSearchDisabled = Boolean(category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your inventory</p>
        </div>
      </div>

      {/* Controls Bar: Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            type="text"
            value={isSearchDisabled ? '' : searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={isSearchDisabled}
            placeholder={
              isSearchDisabled
                ? 'Clear category to search'
                : 'Search products by title or brand...'
            }
            title={isSearchDisabled ? 'Clear category to search' : ''}
            className={`w-full pl-9 pr-9 py-2 border rounded-lg text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isSearchDisabled
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-900 border-gray-300 placeholder-gray-400 hover:border-gray-400'
            }`}
          />

          {!isSearchDisabled && searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                updateUrlParams({ q: null, page: 1 });
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label="Clear search input"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {isSearchDisabled && (
            <div className="absolute -bottom-5 left-1 text-[11px] text-amber-600 font-medium">
              Clear category to search
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <Loader text="Loading products..." />
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-sm">
            {q ? `No products found for "${q}"` : 'No products found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <ProductTable products={products} />

          <div className="grid grid-cols-1 gap-4 md:hidden">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination
            total={total}
            page={page}
            limit={limit}
            onPageChange={(newPage) => updateUrlParams({ page: newPage })}
            onLimitChange={(newLimit) => updateUrlParams({ limit: newLimit, page: 1 })}
          />
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<Loader text="Loading dashboard..." />}>
        <ProductListContent />
      </Suspense>
    </ProtectedRoute>
  );
}
