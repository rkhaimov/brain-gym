import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

import BetterSqlite3 from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import { Migrator } from 'kysely/migration';
import { format } from 'oxfmt';

import { migrationProvider } from '../src/server/database/migrations.js';

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'ceramics-ledger-codegen-'));
const databasePath = join(temporaryDirectory, 'schema.sqlite');
const outputPath = resolve('src/server/database/generated.ts');
const generatedOutputPath = join(temporaryDirectory, 'generated.ts');
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
    generatedOutputPath,
  ];

  const codegen = spawnSync(process.execPath, argumentsForCodegen, {
    cwd: dirname(generatedOutputPath),
    stdio: 'inherit',
  });
  if (codegen.error !== undefined) {
    throw codegen.error;
  }
  if (codegen.status !== 0) {
    process.exitCode = codegen.status ?? 1;
  } else {
    const generated = await readFile(generatedOutputPath, 'utf8');
    const formatted = await format(outputPath, generated, { printWidth: 100, singleQuote: true });
    if (formatted.errors.length > 0) {
      throw new Error('Generated database types could not be formatted');
    }
    if (process.argv.includes('--verify')) {
      const current = await readFile(outputPath, 'utf8');
      if (current !== formatted.code) {
        throw new Error('Generated database types are stale; run npm run db:types');
      }
    } else {
      await writeFile(outputPath, formatted.code, 'utf8');
    }
  }
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
