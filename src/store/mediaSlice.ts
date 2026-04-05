import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { fetchMediaPage } from '@api/mediaApi';
import type { AppDispatch, RootState } from '@store';
import type { MediaItem } from '../types/media';
import { createAppAsyncThunk } from './hooks';

type FetchStatus =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; error: string };

type MediaPaginationState = {
  fetchStatus: FetchStatus;
  nextPage: number | null;
  hasMore: boolean;
  total: number;
};

const mediaAdapter = createEntityAdapter<MediaItem>();

const initialState = mediaAdapter.getInitialState<MediaPaginationState>({
  fetchStatus: { status: 'idle' },
  nextPage: 1,
  hasMore: true,
  total: 0,
});

export const fetchNextPage = createAppAsyncThunk(
  'media/fetchNextPage',
  async (_, { getState }) => {
    const state = getState();
    const page = state.media.nextPage ?? 1;
    return fetchMediaPage(page);
  },
  {
    condition: (_, { getState }) => {
      const { fetchStatus, hasMore } = getState().media;
      // prevents double fetch
      return fetchStatus.status !== 'loading' && hasMore;
    },
  },
);

export const removeMediaItem = (id: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  const item = selectMediaById(getState(), id);
  if (item?.url?.startsWith('blob:')) {
    URL.revokeObjectURL(item.url);
  }
  dispatch(mediaSlice.actions.removeOne(id));
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    removeOne: mediaAdapter.removeOne,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNextPage.pending, state => {
        state.fetchStatus = { status: 'loading' };
      })
      .addCase(fetchNextPage.fulfilled, (state, action) => {
        const { items, nextPage, total } = action.payload;
        mediaAdapter.addMany(state, items);
        state.fetchStatus = { status: 'success' };
        state.nextPage = nextPage;
        state.hasMore = nextPage !== null;
        state.total = total;
      })
      .addCase(fetchNextPage.rejected, (state, action) => {
        state.fetchStatus = {
          status: 'error',
          error: action.error.message ?? 'Unknown error',
        };
      });
  },
});

export default mediaSlice.reducer;

const adapterSelectors = mediaAdapter.getSelectors((state: RootState) => state.media);

export const selectMediaById = adapterSelectors.selectById;
export const selectAllMedia = adapterSelectors.selectAll;
export const selectFetchStatus = (state: RootState) => state.media.fetchStatus;
export const selectHasMore = (state: RootState) => state.media.hasMore;
export const selectTotal = (state: RootState) => state.media.total;
