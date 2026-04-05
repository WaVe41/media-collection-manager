import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@store';
import { fetchNextPage, removeMediaItem, selectAllMedia, selectFetchStatus, selectHasMore } from '@store';

export function useMediaGallery() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllMedia);
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
