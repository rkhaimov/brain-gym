# SQLite backup and migration tooling

Date: 2026-11-08

Scope: a local Windows Node.js + TypeScript application using `better-sqlite3` 12.11.1 and Kysely 0.29.8. Findings are based only on SQLite documentation and project-owned documentation, source repositories, release notes, and package registry pages.

## Conclusion

No single mature library reviewed implements the complete required lifecycle:

- produce a complete recoverable copy of a live SQLite database;
- verify the primary and every newly published copy;
- publish atomically and durably without risking an older usable backup;
- retain the latest five routine and pre-migration copies independently;
- block normal startup until backup and migration work succeeds;
- restore an older database and migrate it before serving;
- run on Windows with `better-sqlite3` 12.11.1 and Kysely 0.29.8; and
- keep the destination behind a replaceable application interface.

The best fit is the composition already present in Ceramics:

1. **Keep `better-sqlite3`'s native `Database#backup()` as the copy primitive.** It is a direct binding to SQLite's Online Backup API, produces an ordinary complete SQLite file, works through the already-open application connection, and introduces no second SQLite driver.
2. **Keep Kysely's `Migrator` as the schema migration primitive.** It already matches the data layer and exposes enough migration state to gate a pre-migration copy, but it deliberately does not manage backups, restore, retention, startup availability, or cross-process SQLite migration serialization.
3. **Keep the application-owned coordinator and `BackupDestination` seam.** Those are not accidental glue: they are where the product-specific safety policy lives. The current implementation in `src/server/database/database.ts`, `backup-destination.ts`, `durable-file.ts`, and `sqlite-integrity.ts` supplies capabilities that none of the reviewed libraries combines.
4. **Treat Litestream as a possible later, additional off-device disaster-recovery layer, not a replacement for the local backup-before-migrate path.** It is the strongest mature replication option reviewed, but its artifacts and retention model do not match five independently rotated complete files, it does not coordinate Kysely migrations, and its current releases explicitly do not officially support Windows.

## Constraint matrix

`Yes` means the capability is provided as part of the documented product, not merely possible in caller code.

| Option | Consistent complete database file | Integrity verification | Atomic/durable publication and safe rotation | Independent routine/pre-migration latest-five policies | Startup, restore, then migrate gate | Windows + current stack | Replaceable destination |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `better-sqlite3` 12.11.1 backup API | **Yes** | No | No | No | No | **Yes** | Path only |
| SQLite `VACUUM INTO` | **Yes** | No | Partial: consistent output, but interrupted output may be corrupt | No | No | **Yes** through SQL | Path only |
| Litestream 0.5.x | Restores a complete database, but stores full snapshots plus incremental LTX files | Partial: replica continuity validation; optional integrity check on restore | Strong replication implementation, but not the required local file publication contract | No: time-based, shared snapshot retention | Partial restore/exec support; no Kysely coordination | **No official Windows support** | Replica backends, not the app interface |
| Kysely 0.29.8 `Migrator` | No | No | No | No | Migration half only | **Yes** | Migration provider only |
| Umzug | No | No | No | No | Migration hooks only | Yes | Migration storage/context only |
| Knex migrations | No | No | No | No | Migration half only | Yes, with another query stack | Migration source only |
| `pixl-server-storage` SQLite engine | **Yes**, via `better-sqlite3.backup()` | No backup verification | No documented durable staging; replaces same-name output before backup | One daily `keep` pool | No migration/restore gate | Likely, but would replace the application's storage model | Local backup directory only |
| `sqlite-snap` | Depends on SQLite CLI `.backup`; also offers unsafe raw copy | `PRAGMA integrity_check` through CLI | No durable staging; restore overwrites target directly | One cleanup policy per invocation | No | External CLI required; checksum command is Unix-specific | Local directory only |
| NowBackup | Claims SQLite binary copies, scheduling, local/S3 destinations, and `keepLast` | No documented SQLite integrity check | No documented durable publication | One scheduled retention policy | No migration/restore gate | Claims cross-platform Node use, not this exact stack contract | Local/S3 |
| `saveqlite` | **No**: content-addressed page fragments plus a manifest | No | No | No | No | TypeScript, but unsafe for a changing live file | Object directory only |

No row is close enough that adopting it would remove the application coordinator. The options with the best backup primitive do not own migration policy; the migration frameworks do not own backup policy; the products that combine scheduling and retention do not meet the verification, publication, two-history, and startup-gate requirements.

## 1. SQLite and `better-sqlite3`: the right copy primitive, not a backup system

SQLite documents the Online Backup API as a way to copy one live database into another. The completed destination is a consistent snapshot, and incremental copying releases source locks between steps so other connections can continue working. SQLite also warns that ordinary filesystem copying of an active database can mix old and new pages or omit a required journal/WAL file; the safe choices for a live database are the Online Backup API, `VACUUM INTO`, or `sqlite3_rsync` ([Online Backup API](https://www.sqlite.org/backup.html), [how database files become corrupt](https://www.sqlite.org/howtocorrupt.html#_backup_or_restore_while_a_transaction_is_active)).

`better-sqlite3` 12.11.1 exposes that API as `database.backup(destination, options)`. Its documentation says the result is a regular SQLite database file that can be opened normally. The source connection remains usable during the operation; same-connection writes are reflected, while another connection's writes restart the copy. The promise rejects on failure and supports progress/batch sizing ([12.11.1 API documentation](https://github.com/WiseLibs/better-sqlite3/blob/v12.11.1/docs/api.md#backupdestination-options---promise)). This is exactly the low-level primitive Ceramics needs.

What it intentionally does not provide is equally important. `backup()` accepts a destination path and writes the copy; it does not document integrity checking, temporary-name publication, file or directory synchronization, retention, deduplication, locking across startup processes, migration awareness, or restore orchestration. Those concerns are outside the scope of a SQLite binding. The project's explicit candidate path, destination publication, verification, and rotation therefore remain necessary.

### `VACUUM INTO`

`VACUUM INTO` is the other suitable built-in copy primitive. SQLite says it creates a new file containing the same logical content in a compacted form. Compared with the backup API it can reduce file size and erase deleted content, while the backup API uses fewer CPU cycles and can operate incrementally. The target must be absent or empty. The result is transactionally consistent, but an interrupted operation may leave an incomplete corrupt output; with source `synchronous=NORMAL` or `FULL`, SQLite flushes a successfully completed output using `fsync()` or Windows `FileFlushBuffers()` ([`VACUUM INTO` documentation](https://www.sqlite.org/lang_vacuum.html#vacuum_with_an_into_clause)).

`VACUUM INTO` would still need the same candidate naming, post-copy verification, final publication, rotation, locking, and failure cleanup as `Database#backup()`. It also rewrites the database and consumes more CPU. It is a viable alternative primitive, not a library that replaces the coordinator, and there is no demonstrated benefit for the current small local database that justifies changing primitives.

### Integrity checks are separate

SQLite's `PRAGMA integrity_check` validates low-level formatting, page ownership, freelist structure, index/table consistency, and `UNIQUE`, `CHECK`, and `NOT NULL` constraints; success is exactly one row containing `ok`. It does not validate foreign keys. `quick_check` is faster but skips `UNIQUE` and index/table consistency checks ([pragma documentation](https://www.sqlite.org/pragma.html#pragma_integrity_check)). Running full `integrity_check` against both the primary before backup work and the published candidate before rotation is therefore a separate application decision, correctly not assumed from a successful copy call.

### Windows publication durability has a platform boundary

The current same-directory stage-and-rename sequence gives readers an atomic namespace transition and calls `FileHandle#sync()` before and after the rename. Node documents `sync()` as requesting that all data for the open descriptor be flushed, with the exact behavior depending on the operating system and device ([Node filesystem API](https://nodejs.org/api/fs.html#filehandlesync)).

There is still a narrow Windows power-loss caveat. Node's `rename()` exposes no write-through option, and current libuv implements Windows rename with `MoveFileExW(..., MOVEFILE_REPLACE_EXISTING)` rather than `MOVEFILE_WRITE_THROUGH` ([libuv Windows filesystem source](https://github.com/libuv/libuv/blob/v1.x/src/win/fs.c#L2341)). Microsoft documents `MOVEFILE_WRITE_THROUGH` as the flag that prevents the move operation from returning until the move is flushed to disk ([`MoveFileExW`](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-movefileexw)). Therefore the application has strong staged-file and atomic-visibility behavior, but Node alone does not expose a way to prove the strongest possible guarantee that the new directory entry survives an immediate Windows power loss. None of the surveyed libraries closes that boundary; most document less durability than the current code. This caveat does not change the library decision, but it should remain explicit in recovery expectations and power-failure testing.

## 2. Litestream: mature disaster recovery, different semantics

Litestream is a standalone SQLite disaster-recovery system that continuously replicates database changes. In current 0.5.x it stores full snapshots at level 9 and incremental LTX files at lower compaction levels; restoration reconstructs a complete database. Snapshot interval and retention are time-based and effectively global, rather than count-based and independently tagged per backup purpose ([configuration: snapshots and retention](https://litestream.io/reference/config/#snapshots)).

It has useful adjacent features:

- `replicate -exec` can supervise an application process, and `restore-if-db-not-exists` can restore before replication starts when the local file is absent ([replicate command](https://litestream.io/reference/replicate/)).
- `replicate -once -force-snapshot` can force a full snapshot before maintenance ([run-once mode](https://litestream.io/reference/replicate/#run-once-mode)).
- `restore` can run `quick_check` or full `integrity_check`, though the default is no integrity check ([restore integrity checking](https://litestream.io/reference/restore/#integrity-check)).
- Background validation checks LTX ordering, contiguity, gaps, and overlap. It is disabled by default and is not the same as restoring every snapshot and running SQLite integrity checks ([validation configuration](https://litestream.io/reference/config/#validation)).

Those capabilities do not implement the required policy. Litestream does not know whether Kysely migrations are pending, does not create separately named and independently retained routine versus pre-migration complete files, does not roll the primary back after a failed application migration, and restores automatically only when the local file is absent. `-exec` can compose with an application that migrates before listening, but that leaves the critical migration gate in application code.

Windows is also a decisive mismatch today. Litestream publishes Windows binaries and documents running as a Windows service, but its current release notes explicitly say those binaries are provided for convenience and Windows is **not an officially supported platform** ([Windows guide](https://litestream.io/guides/windows/), [v0.5.18 release](https://github.com/benbjohnson/litestream/releases/tag/v0.5.18)). For a Windows-first local application, Litestream should not replace an already working in-process safety path.

Litestream remains attractive later for the failure class the current same-device backups cannot cover: loss of the machine or storage device. That should be an additive decision with restore drills, credentials, and supported-platform risk considered separately.

## 3. Migration frameworks do not close the backup gap

### Kysely 0.29.8

Kysely's `Migrator` can list migration state, apply pending migrations in name order, and return structured success/error/not-executed results. Its own example uses `better-sqlite3`, `SqliteDialect`, and `FileMigrationProvider`, making it the natural migration layer for this stack ([0.29.8 migrator source](https://github.com/kysely-org/kysely/blob/v0.29.8/src/migration/migrator.ts)).

For SQLite, Kysely 0.29.8 reports `supportsTransactionalDdl = false`; the migrator therefore does not wrap the migration run in a transaction. Its SQLite adapter's migration-lock methods are no-ops because it assumes the one reserved connection is sufficient ([0.29.8 SQLite adapter](https://github.com/kysely-org/kysely/blob/v0.29.8/src/dialect/sqlite/sqlite-adapter.ts)). This makes the application's outer startup serialization and pre-migration recoverable copy particularly important. Kysely tracks and executes migrations, but it does not promise cross-process SQLite exclusion or restore a database after a partially applied migration.

Keeping Kysely avoids a second migration ledger and a second schema/query abstraction. The project can continue detecting pending migrations before `migrateToLatest()` and fail closed on `MigrationResultSet.error`.

### Umzug

Umzug is a mature, framework-agnostic TypeScript migration runner with programmatic `pending()`/`up()`/`down()` behavior, pluggable migration storage and context, a file locker, and lifecycle events such as `beforeCommand`, `migrating`, and `migrated`. Those hooks are convenient places for an application to call its own backup code, but Umzug supplies no SQLite copy, integrity, publication, retention, restore, or destination implementation ([Umzug repository and documentation](https://github.com/sequelize/umzug)). Switching would replace Kysely's migration ledger while preserving nearly all of the custom coordinator.

### Knex

Knex has a mature migration API, lists pending/completed migrations, applies batches, and maintains a migration lock table. Its SQLite guidance is a reminder rather than a solution: schema alterations that require foreign-key emulation should disable the automatic migration transaction and use explicit transactions where possible ([Knex migration documentation](https://knexjs.org/guide/migrations.html#transactions-in-migrations)). Knex likewise has no backup or restore lifecycle, and adopting it would add a second query/migration stack beside Kysely.

Migration hooks can make an orchestration point convenient, but they do not turn a migration framework into the required integrated safety system.

## 4. Node packages that claim backup and rotation

### `pixl-server-storage`: credible but tied to another storage model

`pixl-server-storage` is an established, actively maintained storage component. Its SQLite engine uses `better-sqlite3.backup()`, supports daily backup filenames, optional gzip, and `keep: N` rotation ([package documentation](https://www.npmjs.com/package/pixl-server-storage), [SQLite engine source](https://github.com/jhuckaby/pixl-server-storage/blob/master/engines/SQLite.js)). It is the most credible npm implementation found that combines the native copy primitive with rotation.

It is not a generic backup coordinator for an existing Kysely schema. The package owns a key/value `items` table and a broader Pixl storage lifecycle. Its maintenance code removes an existing same-name file before starting the new backup, writes directly to the final path, does not run `integrity_check` on the backup, rotates one undifferentiated directory after completion, and has no migration or restore gate. Adopting it would replace the application's data/storage model and still fail the core guarantees.

### `sqlite-snap`: relevant feature claims, insufficient guarantees and maturity

`sqlite-snap` advertises SQLite CLI `.backup`, integrity verification, checksums, cleanup by age/count, and restore ([repository](https://github.com/dmikey/node-sqlite-snap), [published source](https://github.com/dmikey/node-sqlite-snap/blob/main/lib/index.js)). Its implementation requires the external `sqlite3` command, writes directly to the final backup name, offers a raw `copyFileSync` mode that is unsafe for an active database, and overwrites the restore target with `copyFileSync`. Cleanup does not first establish that the retained set is verified. Its checksum helper invokes the Unix `shasum` command and silently returns `null` when unavailable, which is not a sound Windows verification contract. The method named `vacuum` invokes `.backup` rather than `VACUUM INTO`.

The npm package was first published in June 2025 and remains on the initial 1.0.x line ([npm registry metadata](https://registry.npmjs.org/sqlite-snap)). It is useful evidence that the surface area is desirable, but not a mature substitute for the current tested implementation.

### NowBackup: broad scheduling/destination claims, not SQLite safety proof

NowBackup 1.0.3 advertises TypeScript, cron scheduling, local and S3 destinations, compression/encryption, SQLite binary copies, and `retention.keepLast` ([publisher package page](https://www.npmjs.com/package/nowbackup)). The public documentation does not state that SQLite copies use the Online Backup API or `VACUUM INTO`, does not document `PRAGMA integrity_check`, durable staging/rename, independent purpose-specific histories, migration detection, restore-before-serve, or Kysely integration. It was first published in May 2026 and has only the 1.0.x release line in the registry ([npm registry metadata](https://registry.npmjs.org/nowbackup)). The feature breadth does not establish the durability and recovery guarantees needed here.

### `saveqlite`: incremental fragments are the wrong artifact

`saveqlite` calls itself an incremental backup system. Its source reads the database file as pages, stores each page under a content hash, and writes a manifest of fragment paths; restore concatenates those fragments into the target ([backup source](https://github.com/barthofu/saveqlite/blob/main/src/backup.ts), [restore source](https://github.com/barthofu/saveqlite/blob/main/src/restore.ts)). It neither coordinates with SQLite while the live file changes nor produces a standalone complete database per backup. It has no integrity check, durable publication, retention, migration gate, or destination abstraction. Its package manifest defines no real test suite ([package manifest](https://github.com/barthofu/saveqlite/blob/main/package.json)). It directly violates the complete-copy requirement.

### `better-sqlite3-helper`: migration convenience, not integrated protection

`better-sqlite3-helper` offers automatic SQL-file migrations and forwards the underlying `better-sqlite3` API, including `backup()`. It does not couple those features into backup-before-migrate, verification, retention, restore, or startup gating. Its current package depends on `better-sqlite3` 9.x rather than accepting the application's 12.11.1 instance, and its latest release predates the current stack ([package page](https://www.npmjs.com/package/better-sqlite3-helper), [registry metadata](https://registry.npmjs.org/better-sqlite3-helper)). It would create a driver/version conflict without solving the policy.

## 5. Why the project-owned layer is justified

The current code is small because it builds on strong primitives rather than reimplementing SQLite:

- `database.ts` verifies the primary, detects pending migrations, synchronizes the routine copy, creates a distinct pre-migration copy, invokes Kysely, restores the pre-migration candidate on failure, and returns a usable database only after success.
- `backup-destination.ts` defines the replaceable asynchronous `BackupDestination`, serializes publication in-process and through a filesystem lock, separates backup kinds, verifies existing and new files, skips unchanged routine copies, and removes old verified copies only after the new one is published and verified.
- `durable-file.ts` stages a copy, flushes it, renames it, flushes the final file, and synchronizes the directory on platforms where Node supports that operation.
- `sqlite-integrity.ts` enforces the exact one-row `integrity_check = ok` result.

This layer is application policy with integration tests, not a competing database library. Replacing any one primitive remains possible: `Database#backup()` could become `VACUUM INTO`, and the local filesystem destination could become an off-device destination, without changing the startup and migration safety contract.

## Decision

Keep the current implementation and dependency set. Do not add Umzug, Knex, a backup wrapper, or Litestream to satisfy the phase-one startup-backup requirements.

If off-device protection becomes a requirement, evaluate Litestream as a separate operational layer or add a new `BackupDestination` implementation. In either case, retain the local verified pre-migration copy and require a Windows restore drill before treating the new destination as recovery-ready.
