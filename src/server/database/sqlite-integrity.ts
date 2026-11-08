import type BetterSqlite3 from 'better-sqlite3';

export function assertSqliteIntegrity(
  database: BetterSqlite3.Database,
  databasePath: string,
): void {
  const result = database.pragma('integrity_check');
  if (
    !Array.isArray(result) ||
    result.length !== 1 ||
    typeof result[0] !== 'object' ||
    result[0] === null ||
    Reflect.get(result[0], 'integrity_check') !== 'ok'
  ) {
    throw new Error(`SQLite integrity check failed for ${databasePath}`);
  }
}
