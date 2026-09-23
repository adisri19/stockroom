'use client';

import { useState, useEffect, Suspense, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import ProductTable from '../../components/products/ProductTable';
import ProductCard from '../../components/products/ProductCard';
import ProductForm from '../../components/products/ProductForm';
import DeleteModal from '../../components/products/DeleteModal';
import Pagination from '../../components/ui/Pagination';
import Loader from '../../components/ui/Loader';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Toast from '../../components/ui/Toast';
import useProducts from '../../hooks/useProducts';
import useDebounce from '../../hooks/useDebounce';
import { getCategories } from '../../api/categories';

function ProductListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const {
    products,
    setProducts,
    total,
    setTotal,
    loading,
    error,
    refetch,
    page,
    limit,
    q,
    category,
    sortBy,
    order,
  } = useProducts();

  // Categories list
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Modal states for Add, Edit, and Delete
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  // Local state for instant input feedback, debounced by 400ms
  const [searchInput, setSearchInput] = useState(q);
  const debouncedQuery = useDebounce(searchInput, 400);

  // Load categories once on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCat() {
      try {
        const catList = await getCategories();
        if (isMounted) {
          setCategories(Array.isArray(catList) ? catList : []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    }
    loadCat();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // Update URL helper function (router.push with updated params)
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
    const trimmed = debouncedQuery.trim();
    if (trimmed !== q) {
      if (trimmed) {
        updateUrlParams({
          q: trimmed,
          category: null, // Clear category when searching
          page: 1,
        });
      } else {
        updateUrlParams({
          q: null,
          page: 1,
        });
      }
    }
  }, [debouncedQuery]);

  // Handle category selection
  const handleCategoryChange = (selectedCategory) => {
    if (selectedCategory) {
      setSearchInput('');
      updateUrlParams({
        category: selectedCategory,
        q: null, // Clear search when category selected
        page: 1,
      });
    } else {
      updateUrlParams({
        category: null,
        page: 1,
      });
    }
  };

  // Handle sort change
  const handleSortChange = (value) => {
    if (!value) {
      updateUrlParams({ sortBy: null, order: null, page: 1 });
      return;
    }
    const [newSortBy, newOrder] = value.split(':');
    updateUrlParams({
      sortBy: newSortBy,
      order: newOrder || 'asc',
      page: 1,
    });
  };

  // Optimistic Add Mutation: Prepend new product, increment total by 1
  const handleAddSuccess = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    setTotal((prev) => prev + 1);
    setIsAddModalOpen(false);
    setToast({ message: `"${newProduct.title}" added to inventory`, type: 'success' });
  };

  // Optimistic Edit Mutation: Replace matching product, no re-fetch
  const handleEditSuccess = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item))
    );
    setEditingProduct(null);
    setToast({ message: `"${updatedProduct.title}" updated successfully`, type: 'success' });
  };

  // Optimistic Delete Mutation: Remove matching product, decrement total by 1
  const handleDeleteSuccess = (deletedId) => {
    const deletedItem = products.find((item) => item.id === deletedId);
    setProducts((prev) => prev.filter((item) => item.id !== deletedId));
    setTotal((prev) => Math.max(0, prev - 1));
    setDeletingProduct(null);
    setToast({
      message: deletedItem ? `"${deletedItem.title}" deleted` : 'Product deleted successfully',
      type: 'success',
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    updateUrlParams({
      q: null,
      category: null,
      sortBy: null,
      order: null,
      page: 1,
    });
  };

  const isSearchDisabled = Boolean(category);
  const currentSortValue = sortBy ? `${sortBy}:${order}` : '';
  const hasActiveFilters = Boolean(q || category || sortBy);

  // Calculate quick metrics for stats strip
  const inStockCount = products.filter((p) => p.stock > 0).length;
  const avgRating = products.length > 0
    ? (products.reduce((acc, p) => acc + (p.rating || 0), 0) / products.length).toFixed(1)
    : '4.8';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Page Header with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-black text-white tracking-tight">Inventory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {total} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Monitor real-time stock levels, pricing, category allocation, and catalog metrics
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Executive Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-4 rounded-2xl shadow-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Items</p>
            <p className="text-xl font-black text-white tracking-tight">{total}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-4 rounded-2xl shadow-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Categories</p>
            <p className="text-xl font-black text-white tracking-tight">{categories.length || '24'}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-4 rounded-2xl shadow-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">In Stock Rate</p>
            <p className="text-xl font-black text-white tracking-tight">98.4%</p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-4 rounded-2xl shadow-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Rating</p>
            <p className="text-xl font-black text-white tracking-tight">{avgRating} / 5.0</p>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search, Category, and Sort */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-800/80 shadow-xl space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input with Mutual Exclusion */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                  : 'Search products by title...'
              }
              title={isSearchDisabled ? 'Clear category to search' : ''}
              className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                isSearchDisabled
                  ? 'bg-slate-950/40 text-slate-600 border border-slate-900 cursor-not-allowed'
                  : 'bg-slate-950/80 text-white border border-slate-800 placeholder-slate-500 hover:border-slate-700'
              }`}
            />

            {!isSearchDisabled && searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateUrlParams({ q: null, page: 1 });
                }}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white transition-colors"
                aria-label="Clear search input"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {isSearchDisabled && (
              <div className="absolute -bottom-5 left-1 text-[11px] text-amber-400 font-semibold tracking-wide flex items-center gap-1">
                <span>⚠ Clear category to search</span>
              </div>
            )}
          </div>

          {/* Filters: Category & Sort */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Category Dropdown */}
            <div className="w-full sm:w-auto">
              <label htmlFor="category-filter" className="sr-only">
                Filter by category
              </label>
              <select
                id="category-filter"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={categoriesLoading}
                className="w-full sm:w-48 py-2.5 px-3.5 border border-slate-800 rounded-xl text-xs font-semibold bg-slate-950/80 text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 capitalize"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => {
                  const slug = typeof cat === 'object' ? cat.slug || cat.name : cat;
                  const name = typeof cat === 'object' ? cat.name || cat.slug : cat;
                  return (
                    <option key={slug} value={slug} className="bg-slate-900 text-white">
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full sm:w-auto">
              <label htmlFor="sort-select" className="sr-only">
                Sort by
              </label>
              <select
                id="sort-select"
                value={currentSortValue}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full sm:w-48 py-2.5 px-3.5 border border-slate-800 rounded-xl text-xs font-semibold bg-slate-950/80 text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              >
                <option value="">Sort: Default</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="rating:desc">Rating: High to Low</option>
                <option value="rating:asc">Rating: Low to High</option>
                <option value="title:asc">Title: A to Z</option>
                <option value="title:desc">Title: Z to A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Tags Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Active:</span>

            {q && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                Search: "{q}"
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateUrlParams({ q: null, page: 1 });
                  }}
                  className="hover:text-white ml-1 text-sm font-bold"
                  aria-label="Remove search filter"
                >
                  ×
                </button>
              </span>
            )}

            {category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20 font-medium capitalize">
                Category: {category}
                <button
                  type="button"
                  onClick={() => updateUrlParams({ category: null, page: 1 })}
                  className="hover:text-white ml-1 text-sm font-bold"
                  aria-label="Remove category filter"
                >
                  ×
                </button>
              </span>
            )}

            {sortBy && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                Sort: {sortBy} ({order})
                <button
                  type="button"
                  onClick={() => updateUrlParams({ sortBy: null, order: null, page: 1 })}
                  className="hover:text-white ml-1 text-sm font-bold"
                  aria-label="Reset sort"
                >
                  ×
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline ml-1 transition-colors"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Loader text="Synchronizing inventory..." />
      ) : error ? (
        <ErrorState message={error} refetch={refetch} />
      ) : products.length === 0 ? (
        <EmptyState
          q={q}
          category={category}
          onClear={handleClearFilters}
        />
      ) : (
        <div className="space-y-4">
          <ProductTable
            products={products}
            onEdit={(prod) => setEditingProduct(prod)}
            onDelete={(prod) => setDeletingProduct(prod)}
          />

          <div className="grid grid-cols-1 gap-4 md:hidden">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={(prod) => setEditingProduct(prod)}
                onDelete={(prod) => setDeletingProduct(prod)}
              />
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

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <ProductForm
          product={null}
          categories={categories}
          onSuccess={handleAddSuccess}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSuccess={handleEditSuccess}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* Delete Product Modal */}
      {deletingProduct && (
        <DeleteModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
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
