'use client';

export default function EmptyState({
  q = '',
  category = '',
  onClear,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-14 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/80 text-center shadow-xl">
      <div className="w-16 h-16 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-500 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-slate-600"
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

      <h3 className="text-lg font-bold text-white mb-1.5">
        No Products Found
      </h3>

      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
        {q ? (
          <>
            No catalog items matched your query{' '}
            <span className="font-semibold text-indigo-400">"{q}"</span>.
          </>
        ) : category ? (
          <>
            No products are currently available in the category{' '}
            <span className="font-semibold text-indigo-400">"{category}"</span>.
          </>
        ) : (
          'There are no products in your catalog at this time.'
        )}
      </p>

      {onClear && (q || category) && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-700 bg-slate-800/80 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg
            className="w-3.5 h-3.5 text-slate-400"
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
          Reset All Filters
        </button>
      )}
    </div>
  );
}
