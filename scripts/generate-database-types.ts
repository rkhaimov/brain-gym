import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import BetterSqlite3 from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import { Migrator } from 'kysely/migration';

import { migrationProvider } from '../src/server/database/migrations.js';

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'ceramics-ledger-codegen-'));
const databasePath = join(temporaryDirectory, 'schema.sqlite');
const outputPath = resolve('src/server/database/generated.ts');
const codegenEntrypoint = resolve('node_modules', 'kysely-codegen', 'dist', 'cli', 'bin.js');

try {
  const sqlite = new BetterSqlite3(databasePath);
  const database = new Kysely<never>({ dialect: new SqliteDialect({ database: sqlite }) });
  const migrationResult = await new Migrator({
    db: database,
    provider: migrationProvider,
  }).migrateToLatest();

  await database.destroy();
  if (migrationResult.error !== undefined) {
    throw migrationResult.error;
  }

  const argumentsForCodegen = [
    codegenEntrypoint,
    '--dialect',
    'sqlite',
    '--url',
    databasePath,
    '--out-file',
    outputPath,
  ];
  if (process.argv.includes('--verify')) {
    argumentsForCodegen.push('--verify');
  }

  const codegen = spawnSync(process.execPath, argumentsForCodegen, {
    cwd: dirname(outputPath),
    stdio: 'inherit',
  });
  if (codegen.error !== undefined) {
    throw codegen.error;
  }
  if (codegen.status !== 0) {
    process.exitCode = codegen.status ?? 1;
  }
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
