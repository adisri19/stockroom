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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-2xl text-sm text-slate-400 shadow-lg">
      {/* Showing X–Y of Z and Limit selector */}
      <div className="flex flex-wrap items-center gap-4">
        <span>
          Showing <span className="font-semibold text-white">{start}</span>–
          <span className="font-semibold text-white">{end}</span> of{' '}
          <span className="font-semibold text-white">{total}</span> items
        </span>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <label htmlFor="limit-select" className="sr-only">
            Items per page
          </label>
          <span>Rows:</span>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
            className="rounded-xl border border-slate-800 bg-slate-950/80 py-1 px-2.5 text-xs font-semibold text-slate-200 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
        className="flex items-center space-x-1.5"
      >
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/70 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          Previous
        </button>

        <div className="flex items-center space-x-1">
          {pageNumbers.map((item, index) => {
            if (item === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-xs text-slate-600 select-none font-bold"
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
                className={`min-w-[32px] h-8 px-2.5 text-xs font-bold rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.45)]'
                    : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
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
          className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/70 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
