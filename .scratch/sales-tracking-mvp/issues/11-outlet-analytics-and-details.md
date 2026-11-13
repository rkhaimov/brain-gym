# 11: Visualize analytics trends

**What to build:** Add one switchable Overview chart card for Earnings over time and the Earnings-versus-Outlet-share comparison, using the same filters and recalculation flow as Product analytics.

**Blocked by:** 10: Compare Products and Unmapped listings.

**Status:** ready-for-agent

- [ ] The chart card defaults to «Динамика» and switches to «По магазинам» while displaying only the selected chart.
- [ ] Changing date, Outlet, or Product filters updates every chart value; successful Report sync refreshes the values without resetting the selected chart.
- [ ] Ranges through 14 days use calendar-day buckets, ranges through 90 days use clipped ISO-week buckets, and longer ranges use clipped calendar-month buckets.
- [ ] Each complete active report contributes wholly to the bucket containing its Reporting-period end date; empty buckets remain visible and reports are never prorated.
- [ ] The Earnings trend uses stacked bars for the five leading Outlets and combines the remainder as «Остальные».
- [ ] The Outlet comparison uses paired horizontal Earnings and Outlet-share bars for the ten leading Outlets by Sales value and combines the remainder as «Остальные».
- [ ] Tooltips expose exact currency values, bucket ranges, totals, and Outlet-share percentage through pointer and keyboard interaction.
- [ ] Unmapped values remain excluded from chart values, while the existing warning and mapping workflow remain unchanged.
- [ ] The charts use the public shadcn.io Bar Chart design and API as a reference, a local TanStack Charts SVG composition, theme tokens, reduced-motion behavior, and meaningful accessible names and descriptions.
- [ ] Server integration tests verify bucket thresholds and clipping, complete-report assignment, filtering, current mappings, Unmapped exclusion, Outlet grouping, zero buckets, and agreement with Product totals.
- [ ] Prebuilt-client integration and screenshot tests cover switching, keyboard tooltips, top-N aggregation, filter and sync refresh behavior, empty states, and both chart views.
- [ ] The analytics handler completes within two seconds against the seeded ten-year expected dataset on the target computer.

