# 05: Manage Outlets

**What to build:** Let the creator maintain the uniquely named Outlets that hold Products. Outlet identity and history remain stable when its visible name changes.

**Blocked by:** 04: Complete the Product catalog.

**Status:** completed

- [x] The creator can create an Outlet with a non-empty, exactly unique name.
- [x] Outlet names remain unique across active and archived Outlets without normalization.
- [x] The creator can rename an Outlet and all application views resolve its current name.
- [x] The creator can archive and restore an Outlet; the application offers no physical Outlet deletion.
- [x] Archived Outlets are hidden from ordinary new selections while remaining available to historical views.
- [x] Server integration tests cover exact name collisions, rename, archive, and restore against real SQLite.
- [x] Prebuilt-client integration tests cover the complete Outlet lifecycle through the injected transport.

## Comments

- 2026-11-09 — Implemented by `ba5922c`; verified with focused real-SQLite and prebuilt Chromium suites, reviewed Product and Outlet screenshot baselines, resolved the parallel Standards and Spec review findings, and a final `npm run check` (formatting, linting, type checking, generated-artifact verification, 45 tests, and client/server builds).
- 2026-11-13 — Ticket 09 removed Outlet codes from the unpublished model; Yandex Report files now identify Outlets by their exact trimmed parenthesized names and create missing Outlets automatically.

