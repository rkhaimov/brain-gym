# 06: Create Sales reports manually

**What to build:** Let the creator record one Outlet's complete Sales report manually, including the period's aggregated sales and the complete Stock balance at period end. The form explains and enforces the business rules before any data is confirmed.

**Blocked by:** 05: Manage Outlets and Outlet codes.

**Status:** ready-for-agent

- [ ] The creator can start a Sales report for one active Outlet and provide a Reporting period start and end date.
- [ ] The end date cannot precede the start date; repeated or overlapping Reporting periods remain allowed.
- [ ] The sales section accepts one row per exact Outlet listing name with Units sold and total Earnings.
- [ ] The Stock balance section accepts one row per exact Outlet listing name with Stock balance and Outlet price.
- [ ] An exact listing name cannot appear twice within either section but may appear once in each section.
- [ ] One report-specific Outlet price is shared across both sections for the same listing.
- [ ] A sales-only listing requires the creator to provide its Outlet price.
- [ ] Units sold and Stock balances accept only whole non-negative values.
- [ ] Outlet price and Earnings accept only non-negative whole kopecks within the JavaScript safe-integer range.
- [ ] Earnings cannot exceed `Units sold × Outlet price`, and Outlet share is derived as `Units sold × Outlet price − Earnings`.
- [ ] Omitting a listing from sales means zero Units sold, Earnings, and Outlet share for that report.
- [ ] The Stock balance section is stored as a complete period-end inventory; an omitted previously known listing represents zero Stock balance.
- [ ] A report with no sales rows and no Stock balance rows is valid and means zero sales and empty Outlet inventory.
- [ ] Newly encountered Outlet listings may remain Unmapped without preventing save.
- [ ] The entire Sales report is saved atomically through the FIFO mutation queue and one SQLite transaction.
- [ ] Server integration tests cover valid reports and the complete validation matrix using real temporary SQLite databases.
- [ ] Prebuilt-client integration tests cover form behavior and visible validation; this flow is not added to the critical full-system suite.

