# 04: Complete the Product catalog

**What to build:** Complete Product maintenance. The creator can rename, archive, and restore Products without losing history.

**Blocked by:** 02: Establish deterministic browser testing.

**Status:** completed

- [x] The Product catalog distinguishes active and archived Products and hides archived Products from ordinary new selections by default.
- [x] The creator can rename a Product while preserving its immutable identity.
- [x] Creating or renaming uses exact string uniqueness across active and archived Products without case, whitespace, punctuation, or spelling normalization.
- [x] The creator can archive and restore a Product; the application offers no physical Product deletion.
- [x] Every view of a Product, including future historical views, resolves its current canonical name.
- [x] Server integration tests cover Product lifecycle, exact-name collisions, and archive restoration against real SQLite.
- [x] Prebuilt-client integration tests cover Product rename and archive/restore filters.

## Comments

- 2026-11-09 — Acceptance audit completed. Implemented by `80ac4a7`, `3d09f2c`, and `bd831c7`; verified with focused real-SQLite and prebuilt Chromium suites, reviewed visual baselines and five client-test screencasts, and a final `npm run check` (formatting, lint, type checking, generated-artifact verification, 38 tests, and client/server builds).
- 2026-11-09 — Form value drafts and the explicit Clear action moved to the backlog. MVP Product maintenance remains completed; draft implementation and draft-specific browser tests were removed.
- 2026-11-09 — Revised MVP scope verified with `npm run check` (formatting, lint, type checking, generated-artifact verification, 34 tests, and client/server builds).
