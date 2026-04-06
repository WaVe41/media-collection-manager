import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@store';
import { fetchNextPage, removeMediaItem, selectFetchStatus, selectHasMore } from '@store';
import { selectFilteredMedia } from '@store/selectors';
import { useDebounce } from './useDebounce';
import type { MediaFilter, SortOption } from '@store';

type Params = {
  filter: MediaFilter;
  sort: SortOption;
  search: string;
};

export function useMediaGallery({ filter, sort, search }: Params) {
  const dispatch = useAppDispatch();
  const debouncedSearch = useDebounce(search, 300);
  const items = useAppSelector(state => selectFilteredMedia(state, filter, sort, debouncedSearch));
  const fetchStatus = useAppSelector(selectFetchStatus);
  const hasMore = useAppSelector(selectHasMore);

  useEffect(() => {
    dispatch(fetchNextPage());
  }, [dispatch]);

  const loadNextPage = useCallback(() => {
    dispatch(fetchNextPage());
  }, [dispatch]);

  const remove = useCallback(
    (id: string) => {
      dispatch(removeMediaItem(id));
    },
    [dispatch],
  );

  return { items, fetchStatus, hasMore, loadNextPage, remove };
}