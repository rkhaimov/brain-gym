# 03: Protect data during startup and migration

**What to build:** Protect confirmed application data before normal startup and before schema changes. The creator can recover a complete local database copy, while a failed verification, backup, or migration never exposes a partially prepared application.

**Blocked by:** 01: Create and list the first Product end to end.

**Status:** completed

- [x] Backup destinations are represented by a replaceable asynchronous interface, with a local-filesystem destination supplied in phase one.
- [x] Startup backup publication and rotation are protected from concurrent execution and complete before the server accepts ordinary requests.
- [x] Startup verifies the primary SQLite database before creating or rotating any backup.
- [x] When data changed since the latest routine backup, startup creates at most one routine backup for that application run.
- [x] Every backup is a complete recoverable database copy rather than an incremental fragment.
- [x] A new copy is durably and atomically published and then integrity-checked before older backups are eligible for removal.
- [x] Failed creation or verification preserves every previously usable backup and prevents normal startup.
- [x] Routine rotation retains the latest five verified routine backups.
- [x] When migrations are pending, startup first synchronizes the routine backup, then creates and verifies a distinct pre-migration backup, and only then applies migrations.
- [x] Pre-migration rotation retains its latest five verified backups independently from routine backups.
- [x] Migration failure leaves the application unavailable for ordinary use and preserves the pre-migration database and backups.
- [x] Restoring an older verified backup applies all pending migrations before the application serves it.
- [x] Confirmed Product data survives normal shutdown, restart, a compatible application update, and restore from backup.
- [x] Integration tests use isolated temporary directories to cover rotation, failed-backup preservation, integrity rejection, migration ordering, successful restore, and migration of restored older data.
- [x] Recovery documentation explains data and backup locations, routine restore, migration recovery, and the same-device backup limitation.

## Comments

- 2026-11-08 — Acceptance audit completed. Implemented by `ae9b7a3` with review follow-ups `275e2dd` and `169daa4`; verified with `npm run check` (formatting, lint, type checking, generated-artifact verification, 26 tests, and client/server builds).

