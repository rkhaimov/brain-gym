# 09: Import multi-Outlet Report files

**What to build:** Let the creator select the supported Excel Report file, receive a precise rejection for invalid input, and review all valid Outlet reports in one editable form before committing them atomically.

**Blocked by:** 08: Map Outlet listings to Products.

**Status:** ready-for-agent

- [ ] The parser accepts only the fixed phase-one workbook structure containing one Reporting period and one or more Outlet reports.
- [ ] The complete file is parsed and validated before any editable form opens or application data changes.
- [ ] A parsing or validation failure rejects the whole file and reports one actionable problem at a time with its cell or location and expected value kind.
- [ ] Each Outlet code may identify at most one Outlet report in the file.
- [ ] The same exact listing cannot appear twice within an Outlet's sales section or twice within its Stock balance section.
- [ ] An unknown Outlet code rejects the complete file and instructs the creator to create the Outlet or correct its code outside the import flow.
- [ ] An archived Outlet identified by code is dropped by default and can be restored to include its report.
- [ ] Every active Outlet report remains included; the creator cannot selectively drop an active Outlet from an otherwise valid import.
- [ ] A valid file opens one fully editable form grouped by Outlet and uses the same fields, calculations, and validation as manual Sales report creation.
- [ ] The creator can correct parsed periods, listing names, quantities, prices, Earnings, and Product mappings before save.
- [ ] Confirming the import saves every included outlet-local Sales report in one transaction; failure or cancellation saves none.
- [ ] After confirmation, every resulting Sales report can be viewed, edited, archived, or restored independently.
- [ ] An existing report for the same Outlet and Reporting period does not prevent another report from being imported.
- [ ] The import form draft stores parsed editable values but never stores the original Excel binary.
- [ ] Synthetic committed workbook fixtures cover a valid file and individual failures for cell types, duplicate Outlet codes, duplicate listings, unknown Outlets, and invalid periods.
- [ ] Parser and handler integration tests use real Outlets and a real temporary SQLite database.
- [ ] Prebuilt-client tests cover rejection, grouped review, correction, mapping, cancellation, and atomic confirmation.
- [ ] The maximum expected file of roughly 50 Outlets with ten listings each parses and opens its form within five seconds on the target computer.

