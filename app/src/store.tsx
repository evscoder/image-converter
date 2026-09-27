import { configureStore } from '@reduxjs/toolkit';
import { appApi } from './modules/api/auth';
import uiReducer from './modules/slices/ui/slice.ts';

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        [appApi.reducerPath]: appApi.reducer
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(appApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
