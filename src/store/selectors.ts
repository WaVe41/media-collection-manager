import { createSelector } from '@reduxjs/toolkit';
import type { MediaItemView } from '../types/media';
import { adapterSelectors } from './mediaSlice';
import { selectUploadEntities } from './uploadSlice';

export const selectAllMedia = createSelector(
  adapterSelectors.selectAll,
  selectUploadEntities,
  (items, uploadEntities): MediaItemView[] =>
    items.map(item => ({
      ...item,
      url: uploadEntities[item.id]?.url,
      uploadStatus: uploadEntities[item.id]?.uploadStatus,
    })),
);