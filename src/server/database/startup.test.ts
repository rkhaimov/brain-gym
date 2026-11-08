import { copyFile, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, test } from 'vitest';
import BetterSqlite3 from 'better-sqlite3';
import type { MigrationProvider } from 'kysely/migration';

import type { EnvService } from '../env.js';
import { testEnv } from '../../test/server/env.js';
import type { BackupDestination, PublishBackupRequest } from './backup-destination.js';
import { LocalFilesystemBackupDestination } from './backup-destination.js';
import { prepareApplicationDatabase } from './database.js';
import { migrationProvider } from './migrations.js';

const temporaryDirectories: string[] = [];

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'ceramics-ledger-startup-'));
  temporaryDirectories.push(directory);
  return directory;
}

async function startupTestContext() {
  const directory = await temporaryDirectory();
  const databasePath = join(directory, 'ceramics-ledger.sqlite');
  const backupDirectory = join(directory, 'backups');
  return {
    backupDestination: new LocalFilesystemBackupDestination(backupDirectory),
    backupDirectory,
    databasePath,
    directory,
  };
}

async function backupNames(backupDirectory: string, kind: 'routine' | 'pre-migration') {
  const names = await readdir(backupDirectory);
  return names.filter((name) => name.startsWith(`${kind}-`) && name.endsWith('.sqlite'));
}

function tableExists(databasePath: string, tableName: string): boolean {
  const database = new BetterSqlite3(databasePath, { fileMustExist: true, readonly: true });
  try {
    return (
      database
        .prepare<[string], { name: string }>(
          "select name from sqlite_master where type = 'table' and name = ?",
        )
        .get(tableName) !== undefined
    );
  } finally {
    database.close();
  }
}

class RejectingBackupDestination implements BackupDestination {
  constructor(private readonly delegate: BackupDestination) {}

  async runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    return await this.delegate.runExclusive(operation);
  }

  async publish(_request: PublishBackupRequest): Promise<'published' | 'unchanged'> {
    throw new Error('Backup destination is unavailable');
  }
}

class CorruptingBackupDestination implements BackupDestination {
  constructor(private readonly delegate: BackupDestination) {}

  async runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    return await this.delegate.runExclusive(operation);
  }

  async publish(request: PublishBackupRequest): Promise<'published' | 'unchanged'> {
    await writeFile(request.candidatePath, 'not a sqlite database');
    return await this.delegate.publish(request);
  }
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('prepareApplicationDatabase', () => {
  test('publishes one routine backup when data changes and none when it does not', async () => {
    const { backupDestination, backupDirectory, databasePath } = await startupTestContext();

    const initialDatabase = await prepareApplicationDatabase({
      backupDestination,
      databasePath,
      env: testEnv,
    });
    await initialDatabase.db
      .insertInto('products')
      .values({ created_at_ms: 1, id: 'product-1', name: 'Кольцо' })
      .execute();
    await initialDatabase.close();

    const changedDatabase = await prepareApplicationDatabase({
      backupDestination,
      databasePath,
      env: testEnv,
    });
    await changedDatabase.close();

    expect(await backupNames(backupDirectory, 'routine')).toHaveLength(2);

    const unchangedDatabase = await prepareApplicationDatabase({
      backupDestination,
      databasePath,
      env: testEnv,
    });
    await unchangedDatabase.close();

    expect(await backupNames(backupDirectory, 'routine')).toHaveLength(2);
  });

  test('retains the latest five routine and pre-migration backups independently', async () => {
    const { backupDestination, backupDirectory, directory } = await startupTestContext();

    for (let index = 0; index < 7; index += 1) {
      const databasePath = join(directory, `database-${index}.sqlite`);
      const unmigratedDatabase = new BetterSqlite3(databasePath);
      unmigratedDatabase.exec(`create table seed_${index} (value text)`);
      unmigratedDatabase.close();
      const database = await prepareApplicationDatabase({
        backupDestination,
        databasePath,
        env: testEnv,
      });
      await database.close();
    }

    expect(await backupNames(backupDirectory, 'routine')).toHaveLength(5);
    expect(await backupNames(backupDirectory, 'pre-migration')).toHaveLength(5);
  });

  test('rejects a corrupt primary database without changing existing backups', async () => {
    const { backupDestination, backupDirectory, databasePath } = await startupTestContext();
    const database = await prepareApplicationDatabase({
      backupDestination,
      databasePath,
      env: testEnv,
    });
    await database.close();
    const existingBackupNames = await readdir(backupDirectory);

    await writeFile(databasePath, 'not a sqlite database');

    await expect(
      prepareApplicationDatabase({ backupDestination, databasePath, env: testEnv }),
    ).rejects.toThrow();
    expect((await readdir(backupDirectory)).sort()).toEqual(existingBackupNames.sort());
  });

  test('rejects failed backup creation without changing existing backups', async () => {
    const { backupDestination, backupDirectory, databasePath } = await startupTestContext();
    const database = await prepareApplicationDatabase({
      backupDestination,
      databasePath,
      env: testEnv,
    });
    await database.db
      .insertInto('products')
      .values({ created_at_ms: 1, id: 'product-1', name: 'Кольцо' })
      .execute();
    await database.close();
    const existingBackupNames = await readdir(backupDirectory);

    await expect(
      prepareApplicationDatabase({
        backupDestination: new RejectingBackupDestination(backupDestination),
        databasePath,
        env: testEnv,
      }),
    ).rejects.toThrow('Backup destination is unavailable');
    expect((await readdir(backupDirectory)).sort()).toEqual(existingBackupNames.sort());
  });

  test('verifies a published backup before removing any older verified backup', async () => {
    const { backupDestination, backupDirectory, databasePath } = await startupTestContext();

    for (let index = 0; index < 5; index += 1) {
      const database = await prepareApplicationDatabase({
        backupDestination,
        databasePath,
        env: testEnv,
      });
      await database.db
        .insertInto('products')
        .values({ created_at_ms: index, id: `product-${index}`, name: `Штучка ${index}` })
        .execute();
      await database.close();
    }
    const verifiedBackupNames = await backupNames(backupDirectory, 'routine');
    expect(verifiedBackupNames).toHaveLength(5);

    await expect(
      prepareApplicationDatabase({
        backupDestination: new CorruptingBackupDestination(backupDestination),
        databasePath,
        env: testEnv,
      }),
    ).rejects.toThrow();
    const remainingBackupNames = await readdir(backupDirectory);
    expect(verifiedBackupNames.every((name) => remainingBackupNames.includes(name))).toBe(true);
    expect(await backupNames(backupDirectory, 'routine')).toHaveLength(5);
  });

  test('retains the newest backup when several publications have the same timestamp', async () => {
    const { backupDestination, backupDirectory, databasePath } = await startupTestContext();
    const ids = ['z', 'pre-migration', 'y', 'x', 'w', 'v', 'a'];
    const env = {
      now: () => new Date('2026-11-08T12:00:00.000Z'),
      randomUUID() {
        const id = ids.shift();
        if (id === undefined) {
          throw new Error('Test exhausted its backup identifiers');
        }
        return id;
      },
    } satisfies EnvService;

    for (let index = 0; index < 6; index += 1) {
      const database = await prepareApplicationDatabase({ backupDestination, databasePath, env });
      await database.db
        .insertInto('products')
        .values({ created_at_ms: index, id: `product-${index}`, name: `Штучка ${index}` })
        .execute();
      await database.close();
    }

    const routineNames = await backupNames(backupDirectory, 'routine');
    expect(routineNames).toHaveLength(5);
    expect(routineNames.some((name) => name.endsWith('-a.sqlite'))).toBe(true);
  });

  test('finishes interrupted rotation when the primary data is unchanged', async () => {
    const { backupDestination, backupDirectory, databasePath } = await startupTestContext();

    for (let index = 0; index < 5; index += 1) {
      const database = await prepareApplicationDatabase({
        backupDestination,
        databasePath,
        env: testEnv,
      });
      await database.db
        .insertInto('products')
        .values({ created_at_ms: index, id: `product-${index}`, name: `Штучка ${index}` })
        .execute();
      await database.close();
    }
    const synchronizedDatabase = await prepareApplicationDatabase({
      backupDestination,
      databasePath,
      env: testEnv,
    });
    await synchronizedDatabase.close();
    const latestName = (await backupNames(backupDirectory, 'routine')).sort().at(-1);
    if (latestName === undefined) {
      throw new Error('Expected a routine backup');
    }
    await copyFile(
      join(backupDirectory, latestName),
      join(
        backupDirectory,
        'routine-s9999999999999999-2026-11-08T12-00-00-000Z-interrupted.sqlite',
      ),
    );
    expect(await backupNames(backupDirectory, 'routine')).toHaveLength(6);

    const unchangedDatabase = await prepareApplicationDatabase({
      backupDestination,
      databasePath,
      env: testEnv,
    });
    await unchangedDatabase.close();

    expect(await backupNames(backupDirectory, 'routine')).toHaveLength(5);
  });

  test('publishes old schema and data before applying a pending migration', async () => {
    const { backupDirectory, databasePath } = await startupTestContext();
    const legacyDatabase = new BetterSqlite3(databasePath);
    legacyDatabase.exec(
      "create table legacy_products (name text); insert into legacy_products values ('Кольцо')",
    );
    legacyDatabase.close();
    const migrations: MigrationProvider = {
      async getMigrations() {
        return {
          '001_add_migration_marker': {
            async up(database) {
              await database.schema
                .createTable('migration_marker')
                .addColumn('id', 'text')
                .execute();
            },
          },
        };
      },
    };

    const database = await prepareApplicationDatabase({
      backupDestination: new LocalFilesystemBackupDestination(backupDirectory),
      databasePath,
      env: testEnv,
      migrations,
    });
    await database.close();

    const [routineName] = await backupNames(backupDirectory, 'routine');
    const [preMigrationName] = await backupNames(backupDirectory, 'pre-migration');
    if (routineName === undefined || preMigrationName === undefined) {
      throw new Error('Expected routine and pre-migration backups');
    }
    expect(tableExists(join(backupDirectory, routineName), 'legacy_products')).toBe(true);
    expect(tableExists(join(backupDirectory, routineName), 'migration_marker')).toBe(false);
    expect(tableExists(join(backupDirectory, preMigrationName), 'legacy_products')).toBe(true);
    expect(tableExists(join(backupDirectory, preMigrationName), 'migration_marker')).toBe(false);
    expect(tableExists(databasePath, 'migration_marker')).toBe(true);
  });

  test('rejects a failed migration while preserving the prior schema and pre-migration backup', async () => {
    const { backupDestination, backupDirectory, databasePath } = await startupTestContext();
    const initialMigrations: MigrationProvider = {
      async getMigrations() {
        return {
          '001_create_legacy_products': {
            async up(database) {
              await database.schema
                .createTable('legacy_products')
                .addColumn('name', 'text')
                .execute();
            },
          },
        };
      },
    };
    const initialDatabase = await prepareApplicationDatabase({
      backupDestination,
      databasePath,
      env: testEnv,
      migrations: initialMigrations,
    });
    await initialDatabase.close();
    const failingMigrations: MigrationProvider = {
      async getMigrations() {
        return {
          ...(await initialMigrations.getMigrations()),
          '002_fail_after_schema_change': {
            async up(database) {
              await database.schema
                .createTable('failed_migration_marker')
                .addColumn('id', 'text')
                .execute();
              throw new Error('Migration failed');
            },
          },
        };
      },
    };

    await expect(
      prepareApplicationDatabase({
        backupDestination,
        databasePath,
        env: testEnv,
        migrations: failingMigrations,
      }),
    ).rejects.toThrow('Migration failed');

    expect(tableExists(databasePath, 'legacy_products')).toBe(true);
    expect(tableExists(databasePath, 'failed_migration_marker')).toBe(false);
    expect(await backupNames(backupDirectory, 'pre-migration')).toHaveLength(2);
  });

  test('restores a complete older backup and applies pending migrations before use', async () => {
    const { backupDestination, backupDirectory, databasePath, directory } =
      await startupTestContext();
    const database = await prepareApplicationDatabase({
      backupDestination,
      databasePath,
      env: testEnv,
    });
    await database.db
      .insertInto('products')
      .values({ created_at_ms: 1, id: 'product-1', name: 'Кольцо' })
      .execute();
    await database.close();
    const backedUpDatabase = await prepareApplicationDatabase({
      backupDestination,
      databasePath,
      env: testEnv,
    });
    await backedUpDatabase.close();
    const routineNames = await backupNames(backupDirectory, 'routine');
    const latestRoutineName = routineNames.sort().at(-1);
    if (latestRoutineName === undefined) {
      throw new Error('Expected a routine backup');
    }
    const restoredDatabasePath = join(directory, 'restored.sqlite');
    await copyFile(join(backupDirectory, latestRoutineName), restoredDatabasePath);
    const newerMigrations: MigrationProvider = {
      async getMigrations() {
        return {
          ...(await migrationProvider.getMigrations()),
          '002_add_restored_marker': {
            async up(migrationDatabase) {
              await migrationDatabase.schema
                .createTable('restored_migration_marker')
                .addColumn('id', 'text')
                .execute();
            },
          },
        };
      },
    };

    const restoredDatabase = await prepareApplicationDatabase({
      backupDestination: new LocalFilesystemBackupDestination(join(directory, 'restored-backups')),
      databasePath: restoredDatabasePath,
      env: testEnv,
      migrations: newerMigrations,
    });
    await expect(
      restoredDatabase.db.selectFrom('products').select('name').execute(),
    ).resolves.toEqual([{ name: 'Кольцо' }]);
    await restoredDatabase.close();
    expect(tableExists(restoredDatabasePath, 'restored_migration_marker')).toBe(true);
  });

  test('serializes concurrent startup backup and migration work', async () => {
    const { backupDestination, backupDirectory, databasePath } = await startupTestContext();

    const databases = await Promise.all([
      prepareApplicationDatabase({ backupDestination, databasePath, env: testEnv }),
      prepareApplicationDatabase({ backupDestination, databasePath, env: testEnv }),
    ]);
    await Promise.all(databases.map(async (database) => await database.close()));

    expect(await backupNames(backupDirectory, 'routine')).toHaveLength(2);
    expect(await backupNames(backupDirectory, 'pre-migration')).toHaveLength(1);
    expect((await readdir(backupDirectory)).some((name) => name.endsWith('.publishing'))).toBe(
      false,
    );
  });
});
