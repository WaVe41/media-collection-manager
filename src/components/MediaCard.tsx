import type { MediaItemView, MediaType } from '../types/media';
import { formatBytes } from '../utils/formatBytes';
import { CloseButton } from '@components/CloseButton.tsx';

type Props = {
  item: MediaItemView;
  onRemove: (id: string) => void;
};

const TYPE_STYLES: Record<MediaType, { badge: string; thumbnail: string; type: string }> = {
  image: {
    badge: 'bg-blue-100 text-blue-700',
    thumbnail: 'bg-blue-50',
    type: 'image',
  },
  video: {
    badge: 'bg-purple-100 text-purple-700',
    thumbnail: 'bg-purple-50',
    type: 'video',
  },
  document: {
    badge: 'bg-emerald-100 text-emerald-700',
    thumbnail: 'bg-emerald-50',
    type: 'document',
  },
};

export function MediaCard({ item, onRemove }: Props) {
  const styles = TYPE_STYLES[item.type];
  const isTypeUploaded = item.kind === 'uploaded';
  const isUploading = isTypeUploaded && item.uploadStatus === 'uploading';
  const isUploadError = isTypeUploaded && item.uploadStatus === 'error';

  return (
    <div className="relative flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className={`${styles.thumbnail} relative flex items-center justify-center aspect-square text-4xl`}>
        {isTypeUploaded && item.thumbnail ? (
          <img src={item.thumbnail} alt={item.name} className="h-full w-full" />
        ) : isTypeUploaded && item.url && item.type === 'image' ? (
          <img src={item.url} alt={item.name} className="h-full w-full" />
        ) : (
          <span className="select-none">{styles.type}</span>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/40">
            <span className="text-xs font-medium text-white">Uploading…</span>
          </div>
        )}

        {isUploadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/50">
            <span className="text-xs font-medium text-white">Upload failed</span>
          </div>
        )}

        {!isUploading && <CloseButton handleClick={() => onRemove(item.id)} />}
      </div>

      <div className="flex flex-col gap-1 p-3">
        <p className="truncate text-sm font-medium text-slate-800" title={item.name}>
          {item.name}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className={`${styles.badge} inline-block rounded-full px-2 py-0.5 text-xs font-semibold`}>
            {item.type}
          </span>
          <span className="text-xs text-slate-500">{formatBytes(item.size)}</span>
        </div>
      </div>
    </div>
  );
}
