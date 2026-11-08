import { resolve } from 'node:path';

import sirv from 'sirv';
import type { Plugin } from 'vite';

export function createTestApplicationStaticPlugin(): Plugin {
  return {
    name: 'ceramics-test-application-static',
    configureServer(server) {
      server.middlewares.use(
        '/__test-application/',
        sirv(resolve('dist/test-application'), {
          dev: true,
          etag: true,
          extensions: [],
        }),
      );
    },
  };
}
