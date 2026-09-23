'use client';

export default function Loader({ text = 'Loading...' }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex flex-col items-center justify-center p-12 min-h-[250px]"
    >
      <div className="relative">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin shadow-glow-sm" />
        <div className="absolute inset-0 w-12 h-12 border-4 border-purple-500/10 border-b-purple-500 rounded-full animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
      </div>
      {text && <p className="mt-4 text-xs font-semibold tracking-wide text-slate-400 uppercase">{text}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
