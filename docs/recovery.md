# Local database backup and recovery

Ceramics keeps its production data in `.local/ceramics-ledger.sqlite`. Startup must finish
database verification, backup publication, and any pending migrations before the local server
listens for requests.

## Backup location and retention

Complete SQLite copies are stored in `.local/backups/`:

- `routine-*.sqlite` files protect the latest changed application data. Startup retains the five
  newest verified routine backups.
- `pre-migration-*.sqlite` files capture the database immediately before a pending migration.
  Startup retains the five newest verified pre-migration backups independently.

A backup is published under its final name only after its file contents have been flushed. Startup
then runs SQLite's integrity check against the published copy before an older verified backup can
be removed. Files ending in `.publishing` are incomplete and must not be restored.

## Routine restore

1. Stop every running Ceramics server.
2. Preserve the current `.local/ceramics-ledger.sqlite` under a separate name outside the backup
   directory. Do not overwrite a backup while investigating a recovery.
3. Choose a verified `routine-*.sqlite` file from `.local/backups/` and copy it to
   `.local/ceramics-ledger.sqlite`.
4. Start Ceramics normally. Startup verifies the restored copy, protects it with the normal backup
   sequence, applies every pending migration, and only then serves requests.
5. Confirm that expected Products and other data are present before discarding the preserved
   database from step 2.

Always restore by copying a backup. Keep the backup itself unchanged so another recovery attempt
remains possible.

## Migration recovery

If startup reports a migration failure, the server remains unavailable. The primary database is
replaced with the verified pre-migration copy made for that attempt, and the published
`pre-migration-*.sqlite` backup remains available.

Keep the application stopped while investigating. Preserve the failed primary and all backups,
correct or roll back the application update, and retry startup. If the primary cannot be used,
follow the routine restore steps with the newest appropriate `pre-migration-*.sqlite` file. A
compatible application version may be used to inspect that copy; a newer compatible version will
apply its pending migrations during startup.

## Same-device limitation

Phase-one backups use the local filesystem. They protect against a damaged database, a failed
migration, or an accidental replacement, but they do not protect against loss, theft, or complete
failure of the computer or its storage. Periodically copy the backup directory to separately
managed storage when protection from device loss is required.
