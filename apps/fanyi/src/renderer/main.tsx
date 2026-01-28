import './index.css';

import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';

import App from '@renderer/App';
import { queryClient } from '@renderer/query';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster richColors />
    </QueryClientProvider>
  </React.StrictMode>
);
