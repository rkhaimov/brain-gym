import { startApplicationServer } from './application-server.js';
import { resolveApplicationDataDirectory } from './data-directory.js';
import { announceAndHandleShutdown } from './process-lifecycle.js';

const dataDirectory = resolveApplicationDataDirectory(process.env['CERAMICS_DATA_DIR']);

const server = await startApplicationServer({
  dataDirectory,
});

announceAndHandleShutdown(server);
