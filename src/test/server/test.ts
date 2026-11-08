import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { test as baseTest } from 'vitest';

import { LocalFilesystemBackupDestination } from '../../server/database/backup-destination.js';
import { prepareApplicationDatabase } from '../../server/database/database.js';
import type { ApplicationDatabase } from '../../server/database/database.js';

export interface TestDatabase {
  readonly value: ApplicationDatabase;
  restart(): Promise<void>;
}

interface ServerFixtures {
  readonly database: TestDatabase;
}

export const test = baseTest.extend<ServerFixtures>({
  database: async ({ task: _task }, use) => {
    const temporaryDirectory = await mkdtemp(join(tmpdir(), 'ceramics-ledger-server-'));
    const databasePath = join(temporaryDirectory, 'test.sqlite');
    const backupDestination = new LocalFilesystemBackupDestination(
      join(temporaryDirectory, 'backups'),
    );
    let currentDatabase: ApplicationDatabase | undefined = await prepareApplicationDatabase({
      backupDestination,
      databasePath,
    });

    function database(): ApplicationDatabase {
      if (currentDatabase === undefined) {
        throw new Error('Test database is not open');
      }
      return currentDatabase;
    }

    try {
      await use({
        get value() {
          return database();
        },
        async restart() {
          const openDatabase = database();
          currentDatabase = undefined;
          await openDatabase.close();
          currentDatabase = await prepareApplicationDatabase({ backupDestination, databasePath });
        },
      });
    } finally {
      try {
        await currentDatabase?.close();
      } finally {
        await rm(temporaryDirectory, { force: true, recursive: true });
      }
    }
  },
});
