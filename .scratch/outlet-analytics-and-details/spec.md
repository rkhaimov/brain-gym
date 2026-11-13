# Outlet Analytics and Details — Backlog

Status: needs-triage

## Deferred scope

Add a filtered Outlet comparison and expand the existing Outlet page into one place for current Stock by exact Report listing, mapped Product results, visible Unmapped work, and complete Sales report history. This work was deferred when MVP ticket 11 was revised to deliver Overview charts.

## User stories

1. As the creator, I can compare and sort Outlets by current Stock, Units sold, Earnings, and Outlet share using the Overview date, Outlet, and Product filters.
2. As the creator, I can open one Outlet without losing the dashboard context and see current Stock balances by exact Report listing.
3. As the creator, I can see filtered Product results and visibly marked Unmapped listings for the Outlet.
4. As the creator, I retain the complete active and archived Sales report history and can open historical reports.
5. As the creator, historical contexts resolve the current Outlet name and retain archived Outlets without offering them in ordinary active selections.

## Implementation decisions

- Reuse the Overview filter semantics, current query-time Product mappings, complete-report aggregation, and latest-report Stock tie rules.
- Keep Unmapped values excluded from mapped totals while showing the exact Unmapped listings that require work.
- Extend the existing `/outlets/$outletId` page rather than introducing a second Outlet-detail destination.
- Preserve the report-history and historical-report workflows delivered by ticket 07.
- Validate server grouping, filtered-total agreement, archive behavior, navigation, current Stock, Product results, Unmapped work, and report history through the established real-SQLite and prebuilt-browser seams.
