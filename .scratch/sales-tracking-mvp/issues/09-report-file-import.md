# 09: Import new Report files from Yandex Mail

**What to build:** Let the creator explicitly fetch new Твоя Полка Report files from Yandex Mail and import the complete validated mailbox batch without opening an editable review form.

**Blocked by:** 08: Map Report listings to Products.

**Status:** completed

- [x] The Outlets page provides a labelled «Загрузить отчёты из почты» action with pending, success, no-new-files, and failure states.
- [x] A click reads only INBOX messages newer than the last successfully scanned IMAP UID, without changing message flags or mailbox contents.
- [x] Matching messages contain `Твоя полка` and exactly one `.xlsx` attachment whose name contains `Отчёт по продажам`, treating `е` and `ё` as equivalent.
- [x] The mailbox account, UIDVALIDITY, and highest successfully scanned UID are persisted; an account or UIDVALIDITY change fails instead of rescanning history.
- [x] Every selected workbook is parsed and validated before application data or the mail cursor changes.
- [x] The parser accepts the observed header-driven Твоя Полка workbook layouts, one Reporting period, and one or more Outlet reports.
- [x] `Магазин "Твоя Полка" (<name>)` supplies the exact trimmed Outlet name from parentheses, preserving underscores and otherwise performing no normalization.
- [x] An exact-name Outlet is reused even when archived; a missing Outlet is created active, and import does not restore an archived Outlet.
- [x] Every Outlet appearing in either the Sales or Stock-balance section receives one independent Sales report for that Report file.
- [x] Listing summary rows supply report values and individual transaction rows are ignored.
- [x] Sales value comes from `Сумма продажи`, Earnings comes from `Сумма комитента`, and a missing historical Earnings column stores zero.
- [x] Stock outlet price comes from `Цена`, and a missing historical price column stores zero.
- [x] Ruble values become safe integer kopecks, listing names use trimmed otherwise exact identity, duplicate Sales listings within one Outlet section reject the batch, and repeated Stock listings are combined by summing quantity and retaining the highest listed price.
- [x] Fully refunded Sales summary rows with blank net Units and Sales value and at most a one-kopeck negative Earnings rounding residue are omitted.
- [x] Unknown Report listing names are created with their existing global identity and remain Unmapped.
- [x] All fetched files, Outlets, Report listings, Sales reports, and the cursor commit in one SQLite transaction; any failure saves none of them.
- [x] A successful import reports created file, Sales report, Outlet, and Report listing counts and refreshes affected client queries.
- [x] Ordinary repeated clicks use the IMAP cursor, but a resent workbook under a new UID may import again; content duplicate and revision handling remain backlog work.
- [x] Synthetic committed workbook fixtures cover current and legacy shifted headers, multiple Outlets, missing-value fallbacks, invalid cells and periods, malformed hierarchy, rejected duplicate Sales listings, and combined duplicate Stock listings.
- [x] Connect-handler tests use an injected mailbox adapter and real temporary SQLite; prebuilt Chromium tests cover the complete button lifecycle.
- [x] The real Yandex adapter uses TLS, an app password, read-only INBOX access, and no background synchronization or telemetry.

## Comments

### 2026-11-13 — Implemented

- Implementation commit: `1929a56` (`Implement automatic Yandex Mail report import`).
- Verification: `npm run check` passed formatting, lint, typechecking, generated-artifact verification, 111 tests, and both production builds.
- Real read-only incremental Yandex smoke imported 2 attachments into 6 Sales reports, 3 new Outlets, and 33 new Report listings; the immediate repeat imported 0 files.
- Fixed-base Standards and Spec reviews reported no remaining findings.
- Chromium screencasts cover the pending/success refresh flow and the destructive workbook-error flow.

### 2026-11-13 — Corrected observed workbook parsing

- Repeated Stock listing rows now sum their balances and retain the highest listed Outlet price; duplicate Sales listings remain invalid.
- Fully refunded Sales summaries with blank net Units and Sales value and a one-kopeck negative Earnings rounding residue are omitted.
- Verification: all 526 supplied Yandex workbooks parsed successfully; targeted lint and formatting, full typechecking, and all 79 server tests passed.

