'use client';

import { useState, useEffect, Suspense } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import ProductTable from '../../components/products/ProductTable';
import ProductCard from '../../components/products/ProductCard';
import Loader from '../../components/ui/Loader';
import { getProducts } from '../../api/products';

function ProductListContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts({ limit: 10, skip: 0 }, { signal: controller.signal });
        if (isMounted) {
          setProducts(data.products || []);
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && isMounted) {
          setError(err.message || 'Failed to load products');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your inventory</p>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading products..." />
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      ) : (
        <div>
          {/* Desktop Table */}
          <ProductTable products={products} />

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
