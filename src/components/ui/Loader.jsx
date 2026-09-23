export default function Loader({ text = 'Loading...' }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex flex-col items-center justify-center p-8 min-h-[250px]"
    >
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      {text && <p className="mt-3 text-sm font-medium text-gray-500">{text}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
