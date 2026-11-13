# Product Analytics Drill-down — Backlog

Status: needs-triage

## Deferred scope

Add a read-only Product detail dialog from an Overview table row after the MVP analytics dashboard is established. Follow draft C as the future direction: preserve the dashboard behind a focused dialog, lead with the Product's filtered totals, then show the exact mapped Report listings and an Outlet breakdown for the same date, Outlet, and Product context.

## User stories

1. As the creator, I can open one Product from Overview without losing the dashboard filters or ranking state.
2. As the creator, I can see every currently mapped exact-name Report listing that contributes to the Product's filtered result.
3. As the creator, I can compare the Product's Stock, Units sold, Earnings, and Outlet share by Outlet for the same selected period.
4. As the creator, I can close the dialog and return to the unchanged Overview table position and filters.

## Implementation decisions

- Use a route-addressable, read-only dialog so refresh, back, and forward navigation remain predictable.
- Reuse the dashboard's inclusive date, Outlet, and Product filter semantics and query-time current mappings.
- Keep Unmapped listings out of Product detail because they have no Product identity; mapping remains the dedicated workflow.
- Do not add charts by default. Evaluate a chart only if it answers a concrete comparison question better than the Outlet and listing tables.
- Treat draft C as directional rather than a frozen contract; validate the information hierarchy before implementation.
