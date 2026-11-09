# 07: Correct Sales reports and calculate current Stock

**What to build:** Let the creator inspect and correct Sales report history while the application continuously derives the correct current Stock from active reports. Corrections and archiving recalculate results without losing historical data.

**Blocked by:** 06: Create Sales reports manually.

**Status:** ready-for-agent

- [ ] A Sales report history lists active reports and can be filtered by Outlet and archive state.
- [ ] Opening a report shows its Reporting period, Sales values, historical Stock balances, Stock Outlet prices, Earnings, and Outlet shares.
- [ ] The creator can edit every active report value, including its Reporting period, listings, quantities, Sales values, Stock Outlet prices, and Earnings.
- [ ] A saved Sales report's Outlet cannot be changed in place.
- [ ] Editing applies the same validation and complete-inventory rules as creation and updates the report atomically.
- [ ] Saving an edit updates the report's saved ordering used for equal-date current Stock resolution.
- [ ] The creator can archive and restore a Sales report; the application offers no physical report deletion.
- [ ] Archived reports are read-only until restored and are excluded from current Stock and ordinary analytics by default.
- [ ] Current Stock for each Outlet listing comes from the active report with the latest Reporting period end date.
- [ ] When end dates tie, the report saved most recently determines current Stock.
- [ ] Outlet listing tables sort by immutable Outlet-listing creation time; Sales reports do not persist separate Sales or Stock row positions.
- [ ] Editing, archiving, or restoring a report immediately recalculates current Stock and all dependent totals.
- [ ] Renaming an Outlet changes its displayed name in report history without copying or rewriting an Outlet name inside each report.
- [ ] Server integration tests cover edit recalculation, immutable Outlet association, date ties, saved-order ties, omission-as-zero, archive, and restore.
- [ ] Prebuilt-client integration tests cover history filters, historical inspection, editing, and archive/restore through the mocked client seam.

