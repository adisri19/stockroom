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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your inventory</p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Controls Bar: Search, Category, and Sort */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input with Mutual Exclusion */}
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
                  : 'Search products by title...'
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
                className="w-full sm:w-48 py-2 px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 capitalize"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => {
                  const slug = typeof cat === 'object' ? cat.slug || cat.name : cat;
                  const name = typeof cat === 'object' ? cat.name || cat.slug : cat;
                  return (
                    <option key={slug} value={slug}>
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
                className="w-full sm:w-48 py-2 px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-500 font-medium">Active filters:</span>

            {q && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Search: "{q}"
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateUrlParams({ q: null, page: 1 });
                  }}
                  className="hover:text-indigo-900 ml-0.5"
                  aria-label="Remove search filter"
                >
                  ×
                </button>
              </span>
            )}

            {category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                Category: {category}
                <button
                  type="button"
                  onClick={() => updateUrlParams({ category: null, page: 1 })}
                  className="hover:text-indigo-900 ml-0.5"
                  aria-label="Remove category filter"
                >
                  ×
                </button>
              </span>
            )}

            {sortBy && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                Sort: {sortBy} ({order})
                <button
                  type="button"
                  onClick={() => updateUrlParams({ sortBy: null, order: null, page: 1 })}
                  className="hover:text-gray-900 ml-0.5"
                  aria-label="Reset sort"
                >
                  ×
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline ml-1"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Loader text="Loading products..." />
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
