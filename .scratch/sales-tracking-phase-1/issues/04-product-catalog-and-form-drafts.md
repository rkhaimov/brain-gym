# 04: Complete the Product catalog and form drafts

**What to build:** Complete Product maintenance and protect unfinished Product form work. The creator can rename, archive, and restore Products without losing history, and can recover unsubmitted form values after navigation, refresh, or application restart.

**Blocked by:** 02: Establish deterministic browser testing.

**Status:** completed

- [x] The Product catalog distinguishes active and archived Products and hides archived Products from ordinary new selections by default.
- [x] The creator can rename a Product while preserving its immutable identity.
- [x] Creating or renaming uses exact string uniqueness across active and archived Products without case, whitespace, punctuation, or spelling normalization.
- [x] The creator can archive and restore a Product; the application offers no physical Product deletion.
- [x] Every view of a Product, including future historical views, resolves its current canonical name.
- [x] A reusable Form facility owns browser-local draft parsing, persistence, restoration, stale-write protection, and clearing.
- [x] Each form supplies only a stable draft key and structural schema; structurally invalid stored data is ignored safely.
- [x] Changed form data is stored approximately every five seconds and during page close using synchronous browser storage.
- [x] Each stored draft carries a request timestamp, and an older write cannot replace a newer draft.
- [x] Product create and edit drafts restore after refresh or application restart.
- [x] A draft is cleared only after confirmed save or an explicit Clear action; ordinary navigation or cancel does not silently discard it.
- [x] Server integration tests cover Product lifecycle, exact-name collisions, and archive restoration against real SQLite.
- [x] Prebuilt-client integration tests cover Product rename, archive/restore filters, draft restoration, confirmed-save cleanup, and explicit clearing.

## Comments

- 2026-11-09 — Acceptance audit completed. Implemented by `80ac4a7`, `3d09f2c`, and `bd831c7`; verified with focused real-SQLite and prebuilt Chromium suites, reviewed visual baselines and five client-test screencasts, and a final `npm run check` (formatting, lint, type checking, generated-artifact verification, 38 tests, and client/server builds).

