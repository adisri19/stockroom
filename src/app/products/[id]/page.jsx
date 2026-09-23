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
          console.error('Error fetching product detail:', err);
          setIsNotFound(true);
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
    return <Loader text="Loading product specifications..." />;
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
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-400 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition-all shadow-sm"
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
          Back to Inventory
        </Link>
      </div>

      {/* Main Product Info Grid */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-10">
        {/* Left Column: Image Switcher */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden flex items-center justify-center p-6 relative group">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="text-slate-600 text-xs font-semibold">No image available</div>
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
                  className={`w-16 h-16 rounded-xl bg-slate-950/80 border-2 overflow-hidden flex-shrink-0 transition-all ${
                    selectedImageIndex === index
                      ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-105'
                      : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
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
          <div className="space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-violet-500/10 text-violet-300 capitalize border border-violet-500/20">
                {product.category || 'General'}
              </span>
              {product.brand && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  Brand: {product.brand}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                  product.stock > 10
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : product.stock > 0
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    product.stock > 10
                      ? 'bg-emerald-400'
                      : product.stock > 0
                      ? 'bg-amber-400'
                      : 'bg-rose-400 animate-pulse'
                  }`}
                />
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-300 px-3 py-1 rounded-lg border border-amber-500/20 text-xs font-bold">
                <svg
                  className="w-4 h-4 fill-current text-amber-400"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {Number(product.rating || 0).toFixed(2)}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                ({reviews.length} verified review{reviews.length === 1 ? '' : 's'})
              </span>
            </div>

            {/* Price */}
            <div className="pt-2 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {formattedPrice}
              </span>
              {product.discountPercentage > 0 && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-slate-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {product.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl p-6 lg:p-10 space-y-6">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Customer Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No reviews recorded yet for this item.</p>
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
                  className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {rev.reviewerName || 'Anonymous Reviewer'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{formattedDate}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg
                        key={`star-${i}`}
                        className={`w-3.5 h-3.5 ${
                          i < Math.round(rev.rating || 0)
                            ? 'text-amber-400 fill-current'
                            : 'text-slate-700 fill-current'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-xs font-bold text-slate-300">
                      {rev.rating}/5
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{rev.comment || 'No comment provided'}"
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
