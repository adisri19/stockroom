'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import Loader from '../../../components/ui/Loader';
import ProductNotFound from './not-found';
import { getProduct } from '../../../api/products';

function ProductDetailContent() {
  const params = useParams();
  const id = params?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchDetail() {
      if (!id) return;
      setLoading(true);
      setIsNotFound(false);

      try {
        const data = await getProduct(id, { signal: controller.signal });
        if (isMounted) {
          if (!data || !data.id) {
            setIsNotFound(true);
          } else {
            setProduct(data);
            setSelectedImageIndex(0);
          }
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && isMounted) {
          if (err.response?.status === 404) {
            setIsNotFound(true);
          } else {
            console.error('Error fetching product detail:', err);
            setIsNotFound(true);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDetail();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return <Loader text="Loading product details..." />;
  }

  if (isNotFound || !product) {
    return <ProductNotFound />;
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.thumbnail
    ? [product.thumbnail]
    : [];

  const activeImage = images[selectedImageIndex] || images[0] || '';
  const formattedPrice = `$${Number(product.price || 0).toFixed(2)}`;
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
        >
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Products
        </Link>
      </div>

      {/* Main Product Info Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
        {/* Left Column: Image Switcher */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center p-4">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 text-sm">No image available</div>
            )}
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={`img-thumb-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-16 h-16 rounded-lg bg-gray-50 border-2 overflow-hidden flex-shrink-0 transition-all ${
                    selectedImageIndex === index
                      ? 'border-indigo-600 ring-2 ring-indigo-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={img}
                    alt={`${product.title} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 capitalize border border-indigo-100">
                {product.category || 'General'}
              </span>
              {product.brand && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  Brand: {product.brand}
                </span>
              )}
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                  product.stock > 10
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : product.stock > 0
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md border border-amber-200 text-sm font-semibold">
                <svg
                  className="w-4 h-4 fill-current text-amber-500"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {Number(product.rating || 0).toFixed(2)}
              </div>
              <span className="text-sm text-gray-500">
                ({reviews.length} customer review{reviews.length === 1 ? '' : 's'})
              </span>
            </div>

            {/* Price */}
            <div className="pt-2">
              <span className="text-3xl font-bold text-gray-900">
                {formattedPrice}
              </span>
              {product.discountPercentage > 0 && (
                <span className="ml-3 text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Customer Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No reviews yet for this product.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev, idx) => {
              const formattedDate = rev.date
                ? new Date(rev.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Recent';

              return (
                <div
                  key={`review-${idx}`}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 text-sm">
                      {rev.reviewerName || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-400">{formattedDate}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg
                        key={`star-${i}`}
                        className={`w-3.5 h-3.5 ${
                          i < Math.round(rev.rating || 0)
                            ? 'text-amber-400 fill-current'
                            : 'text-gray-300 fill-current'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-xs font-semibold text-gray-700">
                      {rev.rating}/5
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 leading-normal">
                    "{rev.comment || 'No comment'}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <ProtectedRoute>
      <ProductDetailContent />
    </ProtectedRoute>
  );
}
