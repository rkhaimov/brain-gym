import { mkdir, rm } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import BetterSqlite3 from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import { DEFAULT_MIGRATION_TABLE, Migrator } from 'kysely/migration';
import type { MigrationProvider } from 'kysely/migration';

import type { BackupDestination, BackupKind } from './backup-destination.js';
import type { DB } from './generated.js';
import { durablyReplaceFileWithCopy } from './durable-file.js';
import { migrationProvider } from './migrations.js';
import { assertSqliteIntegrity } from './sqlite-integrity.js';
import type { EnvService } from '../env.js';
import { productionEnv } from '../env.js';

export interface ApplicationDatabase {
  readonly db: Kysely<DB>;
  close(): Promise<void>;
}

export interface PrepareApplicationDatabaseOptions {
  readonly backupDestination: BackupDestination;
  readonly databasePath: string;
  readonly env?: EnvService;
  readonly migrations?: MigrationProvider;
}

function executedMigrationNames(database: BetterSqlite3.Database): Set<string> {
  const table = database
    .prepare<[string], { name: string }>(
      "select name from sqlite_master where type = 'table' and name = ?",
    )
    .get(DEFAULT_MIGRATION_TABLE);
  if (table === undefined) {
    return new Set();
  }
  const rows = database
    .prepare<[], { name: string }>(`select name from ${DEFAULT_MIGRATION_TABLE}`)
    .all();
  return new Set(rows.map((row) => row.name));
}

async function hasPendingMigrations(
  database: BetterSqlite3.Database,
  provider: MigrationProvider,
): Promise<boolean> {
  const availableNames = Object.keys(await provider.getMigrations());
  const executedNames = executedMigrationNames(database);
  return availableNames.some((name) => !executedNames.has(name));
}

async function publishDatabaseCopy(
  database: BetterSqlite3.Database,
  databasePath: string,
  destination: BackupDestination,
  env: EnvService,
  kind: BackupKind,
  keepCandidate = false,
): Promise<string | undefined> {
  const id = env.randomUUID();
  const candidatePath = join(dirname(databasePath), `.${basename(databasePath)}.${id}.backup`);
  let published = false;
  try {
    await database.backup(candidatePath);
    await destination.publish({
      candidatePath,
      createdAt: env.now(),
      id,
      kind,
      skipIfUnchanged: kind === 'routine',
    });
    published = true;
    return keepCandidate ? candidatePath : undefined;
  } finally {
    if (!keepCandidate || !published) {
      await rm(candidatePath, { force: true });
    }
  }
}

async function replaceDatabaseWithCopy(databasePath: string, copyPath: string): Promise<void> {
  await durablyReplaceFileWithCopy({
    destinationPath: databasePath,
    sourcePath: copyPath,
    stagingPath: `${databasePath}.restoring`,
  });
}

export async function prepareApplicationDatabase(
  options: PrepareApplicationDatabaseOptions,
): Promise<ApplicationDatabase> {
  return await options.backupDestination.runExclusive(async () => {
    const env = options.env ?? productionEnv;
    const provider = options.migrations ?? migrationProvider;
    await mkdir(dirname(options.databasePath), { recursive: true });
    const sqlite = new BetterSqlite3(options.databasePath);
    let kysely: Kysely<DB> | undefined;
    let connectionOpen = true;
    let preMigrationCopyPath: string | undefined;
    try {
      assertSqliteIntegrity(sqlite, options.databasePath);
      const migrationsPending = await hasPendingMigrations(sqlite, provider);
      await publishDatabaseCopy(
        sqlite,
        options.databasePath,
        options.backupDestination,
        env,
        'routine',
      );
      if (migrationsPending) {
        preMigrationCopyPath = await publishDatabaseCopy(
          sqlite,
          options.databasePath,
          options.backupDestination,
          env,
          'pre-migration',
          true,
        );
      }

      kysely = new Kysely<DB>({ dialect: new SqliteDialect({ database: sqlite }) });
      const migrationResult = await new Migrator({ db: kysely, provider }).migrateToLatest();
      if (migrationResult.error !== undefined) {
        await kysely.destroy();
        connectionOpen = false;
        kysely = undefined;
        if (preMigrationCopyPath !== undefined) {
          await replaceDatabaseWithCopy(options.databasePath, preMigrationCopyPath);
        }
        throw migrationResult.error;
      }

      if (preMigrationCopyPath !== undefined) {
        await rm(preMigrationCopyPath, { force: true });
        preMigrationCopyPath = undefined;
      }

      const applicationDatabase = kysely;
      return {
        db: applicationDatabase,
        close: () => applicationDatabase.destroy(),
      };
    } catch (error) {
      if (connectionOpen) {
        if (kysely === undefined) {
          sqlite.close();
        } else {
          await kysely.destroy();
        }
      }
      if (preMigrationCopyPath !== undefined) {
        await rm(preMigrationCopyPath, { force: true });
      }
      throw error;
    }
  });
}
