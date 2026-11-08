# Local database backup and recovery

Ceramics keeps each environment's complete data set under its configured `CERAMICS_DATA_DIR`.
The repository's development and production commands use `.local/development` and
`.local/production` respectively. Startup must finish database verification, backup publication,
and any pending migrations before the local server listens for requests.

## Backup location and retention

The primary database is `<CERAMICS_DATA_DIR>/ceramics-ledger.sqlite`. Complete SQLite copies are
stored in `<CERAMICS_DATA_DIR>/backups/`:

- `routine-*.sqlite` files protect the latest changed application data. Startup retains the five
  newest verified routine backups.
- `pre-migration-*.sqlite` files capture the database immediately before a pending migration.
  Startup retains the five newest verified pre-migration backups independently.

A backup is published under its final name only after its file contents have been flushed. Startup
then runs SQLite's integrity check against the published copy before an older verified backup can
be removed. Files ending in `.publishing` are incomplete and must not be restored.

## Moving data from the previous layout

Older checkouts stored the database directly at `.local/ceramics-ledger.sqlite` and backups at
`.local/backups/`. Before starting the new development or production command for the first time,
stop every server and decide which environment owns that data. Move the database and its complete
backup directory together into either `.local/development/` or `.local/production/`.

Do not copy the old primary into both directories: after separation, each environment owns an
independent database and backup history. Preserve a separate copy while performing the move.

## Routine restore

1. Stop every running Ceramics server.
2. Preserve the current `<CERAMICS_DATA_DIR>/ceramics-ledger.sqlite` under a separate name outside
   the backup directory. Do not overwrite a backup while investigating a recovery.
3. Choose a verified `routine-*.sqlite` file from `<CERAMICS_DATA_DIR>/backups/` and copy it to
   `<CERAMICS_DATA_DIR>/ceramics-ledger.sqlite`.
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

Keep the application stopped while investigating. Preserve the restored primary and all backups,
record the startup error, correct or roll back the application update, and retry startup. If the
primary cannot be used, follow the routine restore steps with the newest appropriate
`pre-migration-*.sqlite` file. A compatible application version may be used to inspect that copy;
a newer compatible version will apply its pending migrations during startup.

## Same-device limitation

Phase-one backups use the local filesystem. A data directory protects against a damaged database,
a failed migration, or an accidental replacement, but it does not protect against loss, theft, or
complete failure of the computer or its storage. Periodically copy the production backup directory
to separately managed storage when protection from device loss is required.
