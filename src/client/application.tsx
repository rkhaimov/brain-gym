import { TransportProvider } from '@connectrpc/connect-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Transport } from '@connectrpc/connect';
import type { Root } from 'react-dom/client';

import { routeTree } from '@/routeTree.gen.js';

export interface ApplicationMountOptions {
  readonly element: HTMLElement;
  readonly queryClient: QueryClient;
  readonly transport: Transport;
}

export function createApplicationQueryClient(): QueryClient {
  return new QueryClient({
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
}

function createApplicationRouter() {
  return createRouter({ routeTree });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createApplicationRouter>;
  }
}

declare module '@tanstack/router-core' {
  interface StaticDataRouteOption {
    readonly pageTitle?: string;
  }
}

export function mountApplication(options: ApplicationMountOptions): Root {
  const root = createRoot(options.element);
  root.render(
    <StrictMode>
      <TransportProvider transport={options.transport}>
        <QueryClientProvider client={options.queryClient}>
          <RouterProvider router={createApplicationRouter()} />
        </QueryClientProvider>
      </TransportProvider>
    </StrictMode>,
  );
  return root;
}
