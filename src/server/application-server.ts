import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { join } from 'node:path';

import { connectNodeAdapter } from '@connectrpc/connect-node';

import type { BackupDestination } from './database/backup-destination.js';
import { LocalFilesystemBackupDestination } from './database/backup-destination.js';
import { prepareApplicationDatabase } from './database/database.js';
import type { EnvService } from './env.js';
import { productionEnv } from './env.js';
import { MutationQueue } from './mutation-queue.js';
import { registerReportListingRoutes } from './report-listing/report-listing-service.js';
import { registerOutletRoutes } from './outlet/outlet-service.js';
import { registerProductRoutes } from './product/product-service.js';
import { registerSalesReportRoutes } from './sales-report/sales-report-service.js';

export interface ApplicationServerOptions {
  readonly backupDestination?: BackupDestination;
  readonly dataDirectory: string;
  readonly env?: EnvService;
  readonly host?: string;
  readonly port?: number;
}

export interface RunningApplicationServer {
  readonly url: string;
  close(): Promise<void>;
}

function listen(
  server: ReturnType<typeof createServer>,
  host: string,
  port: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const onError = (error: Error): void => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = (): void => {
      server.off('error', onError);
      resolve();
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, host);
  });
}

function closeServer(server: ReturnType<typeof createServer>): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error !== undefined) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function serverPort(address: string | AddressInfo | null): number {
  if (address === null || typeof address === 'string') {
    throw new Error('Node server did not expose a TCP address');
  }
  return address.port;
}

export async function startApplicationServer(
  options: ApplicationServerOptions,
): Promise<RunningApplicationServer> {
  const host = options.host ?? '127.0.0.1';
  const env = options.env ?? productionEnv;
  const database = await prepareApplicationDatabase({
    backupDestination:
      options.backupDestination ??
      new LocalFilesystemBackupDestination(join(options.dataDirectory, 'backups')),
    databasePath: join(options.dataDirectory, 'ceramics-ledger.sqlite'),
    env,
  });
  const mutationQueue = new MutationQueue();
  const requestHandler = connectNodeAdapter({
    routes: (router) => {
      registerProductRoutes(router, {
        database,
        env,
        mutationQueue,
      });
      registerOutletRoutes(router, {
        database,
        env,
        mutationQueue,
      });
      registerReportListingRoutes(router, { database });
      registerSalesReportRoutes(router, {
        database,
        env,
        mutationQueue,
      });
    },
  });
  const server = createServer(requestHandler);

  try {
    await listen(server, host, options.port ?? 3001);
  } catch (error) {
    await database.close();
    throw error;
  }

  const port = serverPort(server.address());
  return {
    url: `http://${host}:${port}`,
    async close() {
      await closeServer(server);
      await database.close();
    },
  };
}
