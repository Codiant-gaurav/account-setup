import { configureStore } from '@reduxjs/toolkit';
import { AuthenticationSlice } from '../slices';

export const store = configureStore({
  reducer: {
    authentication: AuthenticationSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
