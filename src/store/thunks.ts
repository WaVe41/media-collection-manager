import { addMediaItem, removeOne } from './slices/mediaSlice';
import { addUploadEntry, removeUploadEntry, selectUploadById } from './slices/uploadSlice';
import { inferMediaType } from '../utils/inferMediaType';
import type { AppThunk } from './store';
import type { MediaItem } from '../types/media';

export const startUploadItem =
  (file: File, id: string): AppThunk =>
  dispatch => {
    const item: MediaItem = {
      id,
      name: file.name,
      type: inferMediaType(file.type),
      size: file.size,
      createdAt: new Date().toISOString(),
    };
    dispatch(addMediaItem(item));
    dispatch(addUploadEntry({ id, uploadStatus: 'uploading' }));
  };

export const removeMediaItem =
  (id: string): AppThunk =>
  (dispatch, getState) => {
    const upload = selectUploadById(getState(), id);

    if (upload?.url?.startsWith('blob:')) URL.revokeObjectURL(upload.url);
    if (upload?.thumbnail?.startsWith('blob:')) URL.revokeObjectURL(upload.thumbnail);

    dispatch(removeOne(id));
    dispatch(removeUploadEntry(id));
  };
