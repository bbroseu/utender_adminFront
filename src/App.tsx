import React from 'react';
import { Provider } from 'react-redux';
import { AppRouter } from './AppRouter';
import { store } from './store';

export function App() {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  );
}