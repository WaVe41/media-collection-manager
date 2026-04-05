import type { MediaItem, MediaType } from '../types/media';
import { formatBytes } from '../utils/formatBytes';
import { CloseButton } from '@components/CloseButton.tsx';

type Props = {
  item: MediaItem;
  onRemove: (id: string) => void;
};

const TYPE_STYLES: Record<MediaType, { badge: string; thumbnail: string; icon: string }> = {
  image: {
    badge: 'bg-blue-100 text-blue-700',
    thumbnail: 'bg-blue-50',
    icon: '🖼',
  },
  video: {
    badge: 'bg-purple-100 text-purple-700',
    thumbnail: 'bg-purple-50',
    icon: '▶',
  },
  document: {
    badge: 'bg-emerald-100 text-emerald-700',
    thumbnail: 'bg-emerald-50',
    icon: '📄',
  },
};

export function MediaCard({ item, onRemove }: Props) {
  const styles = TYPE_STYLES[item.type];

  return (
    <div className="relative flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className={`relative flex items-center justify-center ${styles.thumbnail} aspect-square text-4xl`}>
        {item.url ? (
          item.type === 'image' ? (
            <img src={item.url} alt={item.name} className="h-full w-full" />
          ) : (
            <span className="select-none">{styles.icon}</span>
          )
        ) : (
          <span className="select-none">{styles.icon}</span>
        )}

        <CloseButton handleClick={() => onRemove(item.id)} />
      </div>

      <div className="flex flex-col gap-1 p-3">
        <p className="truncate text-sm font-medium text-slate-800" title={item.name}>
          {item.name}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${styles.badge}`}>
            {item.type}
          </span>
          <span className="text-xs text-slate-500">{formatBytes(item.size)}</span>
        </div>
      </div>
    </div>
  );
}
