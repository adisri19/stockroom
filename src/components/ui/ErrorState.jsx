'use client';

export default function ErrorState({
  message = 'An unexpected error occurred while loading data.',
  refetch,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 my-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-rose-500/20 text-center shadow-xl">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-white mb-1.5">
        Unable to Load Content
      </h3>
      <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
        {message}
      </p>

      {refetch && (
        <button
          type="button"
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Retry Request
        </button>
      )}
    </div>
  );
}
