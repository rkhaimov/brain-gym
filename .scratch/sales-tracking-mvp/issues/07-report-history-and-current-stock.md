# 07: Correct Sales reports and calculate current Stock

**What to build:** Let the creator inspect and correct Sales report history while the application continuously derives the correct current Stock from active reports. Corrections and archiving recalculate results without losing historical data.

**Blocked by:** 06: Create Sales reports manually.

**Status:** completed

- [x] Each Outlet's Sales report history lists active reports and can be filtered by archive state.
- [x] Opening a report shows its Reporting period, Sales values, historical Stock balances, Stock Outlet prices, Earnings, and Outlet shares.
- [x] The creator can edit every active report value, including its Reporting period, listings, quantities, Sales values, Stock Outlet prices, and Earnings.
- [x] A saved Sales report's Outlet cannot be changed in place.
- [x] Editing applies the same validation and complete-inventory rules as creation and updates the report atomically.
- [x] Saving an edit updates the report's saved ordering used for equal-date current Stock resolution.
- [x] The creator can archive and restore a Sales report; the application offers no physical report deletion.
- [x] Archived reports are read-only until restored and are excluded from current Stock and ordinary analytics by default.
- [x] Current Stock for each Outlet listing comes from the active report with the latest Reporting period end date.
- [x] When end dates tie, the report saved most recently determines current Stock.
- [x] Outlet listing tables sort by immutable Outlet-listing creation time; Sales reports do not persist separate Sales or Stock row positions.
- [x] Editing, archiving, or restoring a report immediately recalculates current Stock and all dependent totals.
- [x] Renaming an Outlet changes its displayed name in report history without copying or rewriting an Outlet name inside each report.
- [x] Server integration tests cover edit recalculation, immutable Outlet association, date ties, saved-order ties, omission-as-zero, archive, and restore.
- [x] Prebuilt-client integration tests cover history filters, historical inspection, editing, and archive/restore through the mocked client seam.

## Comments

- 2026-11-11 — Implemented by `538511d`. The generated API now supports complete report updates and reversible archive state, Sales values are derived on reads, report saves use collision-safe monotonic ordering, and current Stock is recalculated from active Outlet reports with period-end and saved-order precedence.
- 2026-11-11 — Verified with focused real-SQLite server integration tests (14), focused prebuilt Chromium Outlet-history tests (11), the shared Product-list owner tests (5), deterministic screenshot review, clean parallel Standards and Spec reviews from `82af88a364a9afd8eae5ad26c38650cd408c5c31`, and final `npm run check` (76 tests plus client/server production builds).
- 2026-11-11 — Recorded the critical edit and archive/restore flows in `test-results/outlet-details-and-sales-report-history-opens-historical-values-and-edits-an-active-report.webm` and `test-results/outlet-details-and-sales-report-history-opens-an-archived-report-read-only-and-restores-it.webm`.

