import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import contractingAuthoritiesReducer from './slices/contractingAuthoritiesSlice';
import contractTypesReducer from './slices/contractTypesSlice';
import emailReducer from './slices/emailSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contractingAuthorities: contractingAuthoritiesReducer,
    contractTypes: contractTypesReducer,
    email: emailReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;