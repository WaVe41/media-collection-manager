import { configureStore } from '@reduxjs/toolkit';
import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import mediaReducer from './mediaSlice';
import uploadReducer from './uploadSlice';

export const store = configureStore({
  reducer: {
    media: mediaReducer,
    upload: uploadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, UnknownAction>;