import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UploadItem } from '../types/media';
import type { RootState } from './store';

const uploadAdapter = createEntityAdapter<UploadItem>();

const uploadSlice = createSlice({
  name: 'upload',
  initialState: uploadAdapter.getInitialState(),
  reducers: {
    addUploadEntry: uploadAdapter.addOne,
    removeUploadEntry: uploadAdapter.removeOne,
    setUploadDone: (state, action: PayloadAction<{ id: string; url: string }>) => {
      uploadAdapter.updateOne(state, {
        id: action.payload.id,
        changes: { uploadStatus: 'done', url: action.payload.url },
      });
    },
    setUploadError: (state, action: PayloadAction<string>) => {
      uploadAdapter.updateOne(state, {
        id: action.payload,
        changes: { uploadStatus: 'error' },
      });
    },
    setUploadRetry: (state, action: PayloadAction<string>) => {
      uploadAdapter.updateOne(state, {
        id: action.payload,
        changes: { uploadStatus: 'uploading' },
      });
    },
    setThumbnail: (state, action: PayloadAction<{ id: string; thumbnail: string }>) => {
      uploadAdapter.updateOne(state, {
        id: action.payload.id,
        changes: { thumbnail: action.payload.thumbnail },
      });
    },
  },
});

export const { addUploadEntry, removeUploadEntry, setUploadDone, setUploadError, setUploadRetry, setThumbnail } =
  uploadSlice.actions;

export default uploadSlice.reducer;

const adapterSelectors = uploadAdapter.getSelectors((state: RootState) => state.upload);

export const selectUploadById = adapterSelectors.selectById;
export const selectUploadEntities = adapterSelectors.selectEntities;
