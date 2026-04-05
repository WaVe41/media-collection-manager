export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-4">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Loading…
      </span>
    </div>
  );
}