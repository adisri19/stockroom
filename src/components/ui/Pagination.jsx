'use client';

export default function Pagination({
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  onLimitChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const start = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const end = Math.min(safePage * limit, total);

  // Generate page numbers (max 5 buttons visible, with ellipsis)
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (safePage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }

    if (safePage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-gray-200 text-sm text-gray-700">
      {/* Showing X–Y of Z and Limit selector */}
      <div className="flex flex-wrap items-center gap-4">
        <span>
          Showing <span className="font-semibold text-gray-900">{start}</span>–
          <span className="font-semibold text-gray-900">{end}</span> of{' '}
          <span className="font-semibold text-gray-900">{total}</span>
        </span>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <label htmlFor="limit-select" className="sr-only">
            Items per page
          </label>
          <span>Per page:</span>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white py-1 px-2.5 text-xs font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Navigation Buttons */}
      <nav
        aria-label="Pagination Navigation"
        className="flex items-center space-x-1"
      >
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <div className="flex items-center space-x-1">
          {pageNumbers.map((item, index) => {
            if (item === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-xs text-gray-400 select-none"
                >
                  …
                </span>
              );
            }

            const isCurrent = item === safePage;
            return (
              <button
                key={`page-${item}`}
                type="button"
                onClick={() => onPageChange && onPageChange(item)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`min-w-[32px] h-8 px-2.5 text-xs font-medium rounded-lg transition-colors ${
                  isCurrent
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange && onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
