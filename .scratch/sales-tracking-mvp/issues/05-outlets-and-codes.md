# 05: Manage Outlets and Outlet codes

**What to build:** Let the creator maintain the Outlets that hold Products and optionally associate each Outlet with the exact code used by Report files. Outlet identity and history remain stable when its visible name or code changes.

**Blocked by:** 04: Complete the Product catalog.

**Status:** completed

- [x] The creator can create an Outlet with a non-empty, exactly unique name.
- [x] Outlet names remain unique across active and archived Outlets without normalization.
- [x] An Outlet code is optional, but every non-empty code is exactly unique across Outlets.
- [x] The creator can add, change, or remove an Outlet code while keeping the same immutable Outlet identity.
- [x] An Outlet without a code remains available for manual work and later analytics.
- [x] Changing or removing a code does not rewrite or detach data associated with the Outlet identity.
- [x] The creator can rename an Outlet and all application views resolve its current name.
- [x] The creator can archive and restore an Outlet; the application offers no physical Outlet deletion.
- [x] Archived Outlets are hidden from ordinary new selections while remaining available to historical views.
- [x] Server integration tests cover exact name/code collisions, code addition/change/removal, rename, archive, and restore against real SQLite.
- [x] Prebuilt-client integration tests cover the complete Outlet lifecycle and the no-code state through the injected transport.

## Comments

- 2026-11-09 — Implemented by `ba5922c`; verified with focused real-SQLite and prebuilt Chromium suites, reviewed Product and Outlet screenshot baselines, resolved the parallel Standards and Spec review findings, and a final `npm run check` (formatting, linting, type checking, generated-artifact verification, 45 tests, and client/server builds).

