import { useMediaGallery } from '@hooks/useMediaGallery';
import { useIntersectionObserver } from '@hooks/useIntersectionObserver';
import { LoadingSpinner } from '@components/LoadingSpinner';
import { MediaCard } from './MediaCard';
import type { MediaFilter, SortOption } from '@store';

type Props = {
  filter: MediaFilter;
  sort: SortOption;
  search: string;
};

export function MediaGallery({ filter, sort, search }: Props) {
  const { items, fetchStatus, hasMore, loadNextPage, remove } = useMediaGallery({ filter, sort, search });

  const handleIntersect = () => {
    if (hasMore && fetchStatus.status !== 'loading') {
      loadNextPage();
    }
  };

  const sentinelRef = useIntersectionObserver(handleIntersect, { rootMargin: '200px' });

  const isMediaLoading = fetchStatus.status === 'loading';
  const isError = fetchStatus.status === 'error';

  return (
    <div className="flex flex-col gap-6">
      {items.length > 0 && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {items.map(item => (
            <MediaCard key={item.id} item={item} onRemove={remove} />
          ))}
        </div>
      )}

      {items.length === 0 && !isMediaLoading && fetchStatus.status !== 'idle' && (
        <p className="py-12 text-center text-sm text-slate-400">No items match your filters</p>
      )}

      {isMediaLoading && <LoadingSpinner />}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center">
          <p className="text-sm font-medium text-red-700">{fetchStatus.error}</p>
          <button
            onClick={loadNextPage}
            className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {!hasMore && !isMediaLoading && items.length > 0 && (
        <p className="py-4 text-center text-sm text-slate-400">End of the list: {items.length} items</p>
      )}

      <div ref={sentinelRef} className="h-px" />
    </div>
  );
}
