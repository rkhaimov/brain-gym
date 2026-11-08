import { TransportProvider } from '@connectrpc/connect-query';
import { createConnectTransport } from '@connectrpc/connect-web';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { routeTree } from '../routeTree.gen.js';
import './styles.css';

const transport = createConnectTransport({
  baseUrl: window.location.origin,
  useBinaryFormat: false,
});

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      networkMode: 'always',
      retry: false,
    },
    queries: {
      networkMode: 'always',
      refetchOnMount: 'always',
      staleTime: 0,
    },
  },
});

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Application root element is missing');
}

createRoot(rootElement).render(
  <StrictMode>
    <TransportProvider transport={transport}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </TransportProvider>
  </StrictMode>,
);
