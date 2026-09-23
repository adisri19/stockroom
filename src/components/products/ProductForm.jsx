'use client';

import { useState, useEffect, useRef } from 'react';
import { addProduct, updateProduct } from '../../api/products';

export default function ProductForm({
  product = null,
  categories = [],
  onSuccess,
  onClose,
}) {
  const isEditing = Boolean(product && product.id);
  const titleInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price !== undefined ? String(product.price) : '',
    stock: product?.stock !== undefined ? String(product.stock) : '',
    category: product?.category || '',
    brand: product?.brand || '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  // Autofocus the title input on mount
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    const numPrice = Number(formData.price);
    if (!formData.price || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Price is required and must be greater than 0';
    }

    const numStock = Number(formData.stock);
    if (
      formData.stock === '' ||
      isNaN(numStock) ||
      !Number.isInteger(numStock) ||
      numStock < 0
    ) {
      newErrors.stock = 'Stock is required and must be an integer (0 or greater)';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: Number(Number(formData.price).toFixed(2)),
      stock: parseInt(formData.stock, 10),
      category: formData.category.trim(),
      brand: formData.brand.trim(),
    };

    try {
      let savedProduct;
      if (isEditing) {
        savedProduct = await updateProduct(product.id, payload);
        savedProduct = { ...product, ...savedProduct, ...payload };
      } else {
        savedProduct = await addProduct(payload);
        savedProduct = {
          ...payload,
          id: savedProduct.id || Date.now(),
          rating: 4.5,
          thumbnail: '',
          images: [],
        };
      }

      if (onSuccess) {
        onSuccess(savedProduct);
      }
    } catch (err) {
      console.error('Failed to submit product:', err);
      setSubmitError(
        err.response?.data?.message ||
          err.message ||
          'Failed to save product. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-800 shadow-[0_0_60px_-15px_rgba(99,102,241,0.3)] w-full max-w-lg rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-950/50">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditing ? 'Modify product specifications' : 'Add an item to the global inventory'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitError && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-500/10 text-rose-300 text-sm rounded-xl border border-rose-500/30">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              className={`block w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                errors.title
                  ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-800 focus:border-indigo-500'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Detailed description of features, materials, etc."
              className="block w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Price ($) <span className="text-rose-400">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="49.99"
                className={`block w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  errors.price
                    ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-rose-400 font-medium">{errors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="stock" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Stock <span className="text-rose-400">*</span>
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                step="1"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="25"
                className={`block w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  errors.stock
                    ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
              {errors.stock && (
                <p className="mt-1 text-xs text-rose-400 font-medium">{errors.stock}</p>
              )}
            </div>
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`block w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  errors.category
                    ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-800 focus:border-indigo-500'
                }`}
              >
                <option value="">Select a category</option>
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
              {errors.category && (
                <p className="mt-1 text-xs text-rose-400 font-medium">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="brand" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Brand
              </label>
              <input
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g. Acme Inc."
                className="block w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-semibold text-slate-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
