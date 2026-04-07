import { createSelector } from '@reduxjs/toolkit';
import type { MediaItemView } from '../types/media';
import { adapterSelectors } from './slices/mediaSlice';
import { selectUploadEntities } from './slices/uploadSlice';
import type { RootState } from './store';

export type MediaFilter = 'all' | 'image' | 'video' | 'document';
export type SortOption = 'none' | 'date' | 'size';

export const selectAllMedia = createSelector(
  adapterSelectors.selectAll,
  selectUploadEntities,
  (items, uploadEntities): MediaItemView[] =>
    items.map(item => {
      const upload = uploadEntities[item.id];
      return upload
        ? { ...item, kind: 'uploaded', url: upload.url, thumbnail: upload.thumbnail, uploadStatus: upload.uploadStatus }
        : { ...item, kind: 'fetched' };
    }),
);

export const selectFilteredMedia = createSelector(
  [
    selectAllMedia,
    (_: RootState, filter: MediaFilter) => filter,
    (_: RootState, _f: MediaFilter, sort: SortOption) => sort,
    (_: RootState, _f: MediaFilter, _s: SortOption, search: string) => search,
  ],
  (items, filter, sort, search): MediaItemView[] => {
    let result = filter === 'all' ? items : items.filter(i => i.type === filter);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q));
    }

    if (sort === 'none') return result;
    return [...result].sort((a, b) =>
      sort === 'size' ? b.size - a.size : b.createdAt.localeCompare(a.createdAt),
    );
  },
);