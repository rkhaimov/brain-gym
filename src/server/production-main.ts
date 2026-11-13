import { fileURLToPath } from 'node:url';

import open from 'open';

import { resolveApplicationDataDirectory } from './data-directory.js';
import { announceAndHandleShutdown } from './process-lifecycle.js';
import { startProductionApplication } from './production-application.js';

const dataDirectory = resolveApplicationDataDirectory(process.env['CERAMICS_DATA_DIR']);
const clientDirectory = fileURLToPath(new URL('../../client/', import.meta.url));
const server = await startProductionApplication({
  browser: {
    async open(url) {
      await open(url);
    },
  },
  clientDirectory,
  dataDirectory,
});

announceAndHandleShutdown(server);
