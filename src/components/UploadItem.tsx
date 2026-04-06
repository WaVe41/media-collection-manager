import type { ActiveUpload } from '@hooks/useUpload';

type Props = {
  item: ActiveUpload;
  onCancel: () => void;
  onRetry: () => void;
};

export function UploadItem({ item, onCancel, onRetry }: Props) {
  const { status, progress, name, error } = item;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-700">{name}</p>
        {status === 'uploading' && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs text-slate-500">{progress}%</span>
          </div>
        )}

        {status === 'error' && <p className="mt-0.5 text-xs text-red-600">{error}</p>}
      </div>

      {status === 'uploading' && (
        <button
          onClick={onCancel}
          className="shrink-0 rounded-md px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          Cancel
        </button>
      )}

      {status === 'error' && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
        >
          Retry
        </button>
      )}
    </div>
  );
}
