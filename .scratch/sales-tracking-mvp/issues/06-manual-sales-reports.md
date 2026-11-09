# 06: Create Sales reports manually

**What to build:** Let the creator record one Outlet's complete Sales report manually, including the period's aggregated sales and the complete Stock balance at period end. The form explains and enforces the business rules before any data is confirmed.

**Blocked by:** 05: Manage Outlets and Outlet codes.

**Status:** completed

- [x] The creator can start a Sales report for one active Outlet and provide a Reporting period start and end date.
- [x] The end date cannot precede the start date; repeated or overlapping Reporting periods remain allowed.
- [x] The sales section accepts one row per trimmed, otherwise exact Outlet listing name with Units sold, Sales value, and Earnings.
- [x] The Stock balance section accepts one row per trimmed, otherwise exact Outlet listing name with Stock balance and Outlet price.
- [x] A trimmed exact listing name cannot appear twice within either section but may appear once in each section.
- [x] Units sold and Stock balances accept only whole non-negative values.
- [x] Sales value, Outlet price, and Earnings accept only non-negative whole kopecks within the JavaScript safe-integer range.
- [x] Earnings cannot exceed Sales value, and Outlet share is derived as `Sales value − Earnings`.
- [x] Omitting a listing from sales means zero Units sold, Earnings, and Outlet share for that report.
- [x] The Stock balance section is stored as a complete period-end inventory; an omitted previously known listing represents zero Stock balance.
- [x] A report with no sales rows and no Stock balance rows is valid and means zero sales and empty Outlet inventory.
- [x] Newly encountered Outlet listings may remain Unmapped without preventing save.
- [x] Each Outlet has a dedicated page with its name and code, an Outlet-listing summary tab, and a Sales-report history tab that opens report creation in a modal.
- [x] Listing fields in both report sections are editable autocompletes that accept known Outlet listings or new names; validation appears beside the field that caused it and numeric values use numeric inputs.
- [x] Outlet listings have immutable IDs and creation timestamps; separate Sales and Stock rows reference those IDs, store non-null zero arithmetic values, and do not persist row positions.
- [x] The entire Sales report is saved atomically through the FIFO mutation queue and one SQLite transaction.
- [x] Server integration tests cover valid reports and the complete validation matrix using real temporary SQLite databases.
- [x] Prebuilt-client integration tests cover form behavior and visible validation; this flow is not added to the critical full-system suite.

## Comments

- 2026-11-09 — Implemented by `e59f75c`; verified through focused real-SQLite and prebuilt Chromium suites, reviewed report and navigation screenshot baselines, resolved the parallel Standards and Spec review findings, and passed the final `npm run check` (formatting, linting, type checking, generated-artifact verification, 61 tests, and client/server builds).
- 2026-11-09 — Revised the unpublished feature around immutable Outlet listings and the dedicated Outlet page: report creation now uses the approved modal/autocomplete design, field-local validation, numeric inputs, and zero-valued report storage without row positions. Verified with 65 tests, generated-artifact checks, and client/server production builds.
- 2026-11-10 — Replaced the Sales unit-price input with aggregate Sales value. Sales storage now persists only Units sold, Earnings, and derived Outlet share; Stock storage independently retains Stock balance and unit Outlet price.

