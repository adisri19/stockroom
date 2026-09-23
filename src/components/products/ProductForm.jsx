'use client';

import { useState } from 'react';
import { addProduct, updateProduct } from '../../api/products';

export default function ProductForm({
  product = null,
  categories = [],
  onSuccess,
  onClose,
}) {
  const isEditing = Boolean(product && product.id);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // title (required)
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    // price (required, number > 0)
    const numPrice = Number(formData.price);
    if (!formData.price || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Price is required and must be greater than 0';
    }

    // stock (required, integer >= 0)
    const numStock = Number(formData.stock);
    if (
      formData.stock === '' ||
      isNaN(numStock) ||
      !Number.isInteger(numStock) ||
      numStock < 0
    ) {
      newErrors.stock = 'Stock is required and must be an integer (0 or greater)';
    }

    // category (required)
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Double submit prevention guard
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
        // Ensure id and existing fields like thumbnail/images remain preserved
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.title
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                  : 'border-gray-300 focus:border-indigo-500'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price ($) <span className="text-red-500">*</span>
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
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.price
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                    : 'border-gray-300 focus:border-indigo-500'
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock <span className="text-red-500">*</span>
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
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.stock
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                    : 'border-gray-300 focus:border-indigo-500'
                }`}
              />
              {errors.stock && (
                <p className="mt-1 text-xs text-red-600">{errors.stock}</p>
              )}
            </div>
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm text-sm capitalize bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.category
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/20'
                    : 'border-gray-300 focus:border-indigo-500'
                }`}
              >
                <option value="">Select a category</option>
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
              {errors.category && (
                <p className="mt-1 text-xs text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
