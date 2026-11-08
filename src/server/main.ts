import { resolve } from 'node:path';

import { startApplicationServer } from './application-server.js';

const server = await startApplicationServer({
  databasePath: resolve('.local', 'ceramics-ledger.sqlite'),
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
