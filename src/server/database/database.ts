import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

import BetterSqlite3 from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import { Migrator } from 'kysely/migration';

import type { DB } from './generated.js';
import { migrationProvider } from './migrations.js';

export interface ApplicationDatabase {
  readonly db: Kysely<DB>;
  close(): Promise<void>;
}

export async function openApplicationDatabase(databasePath: string): Promise<ApplicationDatabase> {
  await mkdir(dirname(databasePath), { recursive: true });
  const sqlite = new BetterSqlite3(databasePath);
  const db = new Kysely<DB>({ dialect: new SqliteDialect({ database: sqlite }) });
  const migrationResult = await new Migrator({ db, provider: migrationProvider }).migrateToLatest();

  if (migrationResult.error !== undefined) {
    await db.destroy();
    throw migrationResult.error;
  }

  return {
    db,
    close: () => db.destroy(),
  };
}
