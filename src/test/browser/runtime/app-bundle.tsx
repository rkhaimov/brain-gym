import type { Transport } from '@connectrpc/connect';
import type { Root } from 'react-dom/client';

import { createApplicationQueryClient, mountApplication } from '@/client/application.js';
import '@/client/styles.css';

export const queryClient = createApplicationQueryClient();

let root: Root | undefined;
let transportOverride: Transport | undefined;

export function overrideTransport(transport: Transport): void {
  transportOverride = transport;
}

export function clearTransportOverride(): void {
  transportOverride = undefined;
}

export function unmount(): void {
  root?.unmount();
  root = undefined;
}

export function mount(): void {
  unmount();

  if (transportOverride === undefined) {
    throw new Error('Browser test must install a generated Connect transport before mounting');
  }
  const element = document.getElementById('root');
  if (element === null) {
    throw new Error('Browser test application root is missing');
  }

  root = mountApplication({ element, queryClient, transport: transportOverride });
}
