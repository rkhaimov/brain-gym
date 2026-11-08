import { createConnectTransport } from '@connectrpc/connect-web';

import { createApplicationQueryClient, mountApplication } from './application.js';
import './styles.css';

const transport = createConnectTransport({
  baseUrl: window.location.origin,
  useBinaryFormat: false,
});

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Application root element is missing');
}

mountApplication({
  element: rootElement,
  queryClient: createApplicationQueryClient(),
  transport,
});
