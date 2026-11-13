# 10: Compare Products and Unmapped listings

**What to build:** Make the Overview dashboard the application home, let the creator filter mapped Product analytics by date, Outlet, and Product, and keep Unmapped work visible as a warning without including it in the numbers.

**Blocked by:** 07: Correct Sales reports and calculate current Stock; 08: Map Report listings to Products.

**Status:** completed

- [x] `/` is the Russian Overview dashboard and its destination appears first in the sidebar.
- [x] The complete Yandex Mail sync panel lives on Overview; a successful sync refetches analytics without resetting route filters.
- [x] The page has rolling last-7-day and last-30-day presets, a custom inclusive date range, searchable multi-select Outlet and Product filters, removable selections, and clear actions; empty selections mean all.
- [x] Sales totals include complete active reports whose Reporting-period end date is inclusively within the selected range and never prorate a report.
- [x] Stock uses each selected Outlet's latest active report at or before the selected end date, including the saved-order tie rule.
- [x] Date, Outlet, and Product filters apply to every KPI, previous-period comparison, Product row, sort, and ranking preset.
- [x] KPI cards show Earnings, Outlet share, Units sold, and end-of-period Stock with signed absolute changes from the preceding equal-length period and a comparison tooltip.
- [x] Product rows use current mappings and canonical names, include archived mapped Products, show sortable Earnings, Outlet share, and Stock columns, and support Most sold, Highest earnings, and Lowest stock presets.
- [x] Relevant Unmapped listings are excluded from every total and row, counted distinctly for the selected date and Outlets, and shown in an amber warning.
- [x] The warning opens the Unmapped mapping view with a validated return URL; returning restores filters and refetches analytics.
- [x] Mapping, remapping, report correction, report archive/restore, sync, Product rename, and Product archive affect the next result without a schema change.
- [x] The dashboard follows the pinned shadcn dashboard composition and defines loading, empty, error, pending-sync, success, no-new-files, and failure states.
- [x] Server integration tests cover inclusive filtering, combined filters, previous periods, as-of Stock and ties, current names, archived Products, remapping, exact Unmapped exclusion/counting, and a ten-year workload against real SQLite.
- [x] Prebuilt-client browser and screenshot tests cover presets and custom dates, searchable filters and clearing, KPIs and tooltips, sorting, mapping return, sync refresh, and page states.
- [x] Ordinary Product analytics complete within two seconds against the seeded ten-year expected dataset on the target computer.
- [x] Product drill-down is deferred to its own backlog specification; this ticket leaves no chart or unused detail placeholder.

## Comments

- 2026-11-13 — Implemented in `ff80fe4` (`feat: add product analytics dashboard`). Verification: `npm run check` passed with formatting, lint, typechecking, generated-source verification, 18 test files and 122 tests, and production client/server builds. Standards and Spec reviews from pre-change commit `b68b6b9` were completed and their findings resolved before commit.

