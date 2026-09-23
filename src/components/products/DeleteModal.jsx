'use client';

import { useState, useEffect, useRef } from 'react';
import { deleteProduct } from '../../api/products';

export default function DeleteModal({ product, onClose, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeleting, onClose]);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  if (!product) return null;

  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setError('');

    try {
      await deleteProduct(product.id);
      if (onSuccess) {
        onSuccess(product.id);
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to delete product. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 transition-opacity"
    >
      <div className="bg-slate-900 border border-slate-800 shadow-[0_0_60px_-15px_rgba(244,63,94,0.3)] w-full max-w-md rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 sm:p-7 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(244,63,94,0.25)]">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3
              id="delete-dialog-title"
              className="text-lg font-bold text-white tracking-tight"
            >
              Delete Product
            </h3>
            <p className="text-xs text-slate-400">Irreversible catalog modification</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Are you sure you want to permanently remove{' '}
          <span className="font-bold text-white bg-slate-800/80 px-1.5 py-0.5 rounded-md border border-slate-700/60">
            "{product.title}"
          </span>{' '}
          from the inventory?
        </p>

        {error && (
          <div className="p-3 bg-rose-500/10 text-rose-300 text-xs rounded-xl border border-rose-500/30">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-semibold text-slate-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Removing...
              </>
            ) : (
              'Confirm Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
