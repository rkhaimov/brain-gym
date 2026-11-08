import { startApplicationServer } from './application-server.js';
import { resolveApplicationDataDirectory } from './data-directory.js';

const dataDirectory = resolveApplicationDataDirectory(process.env['CERAMICS_DATA_DIR']);

const server = await startApplicationServer({
  dataDirectory,
});

console.log(`Ceramics server listening at ${server.url}`);

let shuttingDown = false;
async function shutdown(): Promise<void> {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  await server.close();
}

function handleShutdownSignal(): void {
  shutdown().catch((error: unknown) => {
    console.error('Failed to shut down Ceramics server', error);
    process.exitCode = 1;
  });
}

process.once('SIGINT', handleShutdownSignal);
process.once('SIGTERM', handleShutdownSignal);
