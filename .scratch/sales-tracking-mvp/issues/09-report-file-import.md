# 09: Import new Report files from Yandex Mail

**What to build:** Let the creator explicitly fetch new Твоя Полка Report files from Yandex Mail and import the complete validated mailbox batch without opening an editable review form.

**Blocked by:** 08: Map Report listings to Products.

**Status:** ready-for-agent

- [ ] The Outlets page provides a labelled «Загрузить отчёты из почты» action with pending, success, no-new-files, and failure states.
- [ ] A click reads only INBOX messages newer than the last successfully scanned IMAP UID, without changing message flags or mailbox contents.
- [ ] Matching messages contain `Твоя полка` and exactly one `.xlsx` attachment whose name contains `Отчёт по продажам`, treating `е` and `ё` as equivalent.
- [ ] The mailbox account, UIDVALIDITY, and highest successfully scanned UID are persisted; an account or UIDVALIDITY change fails instead of rescanning history.
- [ ] Every selected workbook is parsed and validated before application data or the mail cursor changes.
- [ ] The parser accepts the observed header-driven Твоя Полка workbook layouts, one Reporting period, and one or more Outlet reports.
- [ ] `Магазин "Твоя Полка" (<name>)` supplies the exact trimmed Outlet name from parentheses, preserving underscores and otherwise performing no normalization.
- [ ] An exact-name Outlet is reused even when archived; a missing Outlet is created active, and import does not restore an archived Outlet.
- [ ] Every Outlet appearing in either the Sales or Stock-balance section receives one independent Sales report for that Report file.
- [ ] Listing summary rows supply report values and individual transaction rows are ignored.
- [ ] Sales value comes from `Сумма продажи`, Earnings comes from `Сумма комитента`, and a missing historical Earnings column stores zero.
- [ ] Stock outlet price comes from `Цена`, and a missing historical price column stores zero.
- [ ] Ruble values become safe integer kopecks, listing names use trimmed otherwise exact identity, and duplicate listings within one Outlet section reject the batch.
- [ ] Unknown Report listing names are created with their existing global identity and remain Unmapped.
- [ ] All fetched files, Outlets, Report listings, Sales reports, and the cursor commit in one SQLite transaction; any failure saves none of them.
- [ ] A successful import reports created file, Sales report, Outlet, and Report listing counts and refreshes affected client queries.
- [ ] Ordinary repeated clicks use the IMAP cursor, but a resent workbook under a new UID may import again; content duplicate and revision handling remain backlog work.
- [ ] Synthetic committed workbook fixtures cover current and legacy shifted headers, multiple Outlets, missing-value fallbacks, invalid cells and periods, malformed hierarchy, and duplicate listings.
- [ ] Connect-handler tests use an injected mailbox adapter and real temporary SQLite; prebuilt Chromium tests cover the complete button lifecycle.
- [ ] The real Yandex adapter uses TLS, an app password, read-only INBOX access, and no background synchronization or telemetry.

