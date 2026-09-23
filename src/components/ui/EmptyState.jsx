'use client';

export default function EmptyState({
  q = '',
  category = '',
  onClear,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-200 text-center shadow-sm">
      <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">
        No products found
      </h3>

      <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">
        {q ? (
          <>
            We couldn't find any products matching{' '}
            <span className="font-semibold text-gray-900">"{q}"</span>.
          </>
        ) : category ? (
          <>
            No products are currently available in the category{' '}
            <span className="font-semibold text-gray-900">"{category}"</span>.
          </>
        ) : (
          'There are no products in your catalog at this time.'
        )}
      </p>

      {onClear && (q || category) && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Clear filters
        </button>
      )}
    </div>
  );
}
