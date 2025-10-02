import React, { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { App as AntdApp } from 'antd';
import { queryClient } from './lib/react-query';
import { setMessageApi } from './utils/toast';
import { ToastProvider } from './components/Toast';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AntdApp>
        <ToastBinder />
        <ToastProvider>
          <App />
        </ToastProvider>
      </AntdApp>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);

function ToastBinder() {
  const { message } = AntdApp.useApp();
  useEffect(() => {
    setMessageApi(message);
  }, [message]);
  return null;
}