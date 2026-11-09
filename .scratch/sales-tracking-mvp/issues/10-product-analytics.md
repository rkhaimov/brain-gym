# 10: Compare Products and Unmapped listings

**What to build:** Let the creator choose the Sales reports and Outlets to analyze, understand overall results, rank Products, and see Unmapped listing groups without losing them from the totals.

**Blocked by:** 07: Correct Sales reports and calculate current Stock; 08: Map Outlet listings to Products.

**Status:** ready-for-agent

- [ ] Analytics accepts one, several, or all complete Sales reports as the sales input.
- [ ] Analytics independently accepts one, several, or all Outlets and combines both filters.
- [ ] Selected reports may cover different Reporting periods, and every selected period remains visible to the creator.
- [ ] Units sold, Earnings, and Outlet share are summed across the selected active reports and selected Outlets.
- [ ] Current Stock uses each listing's latest active report in the selected Outlets rather than summing Stock from selected historical reports.
- [ ] Overall Units sold, Earnings, Outlet share, and current Stock totals appear above the detailed comparison.
- [ ] Product comparison groups all currently mapped Outlet listings under the Product's current canonical name.
- [ ] Unmapped listings appear as visibly marked groups using global exact-name equality and contribute to overall totals.
- [ ] Product and Unmapped rows can be sorted by current Stock, Units sold, Earnings, or Outlet share.
- [ ] Presets select Most sold, Highest earnings, and Lowest stock rankings.
- [ ] Opening a Product shows every mapped Outlet listing contributing to it and breaks its results down by Outlet.
- [ ] Mapping, report correction, report archive/restore, Product rename, and Product archive immediately affect the next analytics result.
- [ ] Server integration tests exercise aggregation, independent filters, latest-state Stock, exact Unmapped grouping, and historical reclassification against a seeded real SQLite database.
- [ ] Prebuilt-client integration and screenshot tests cover filters, totals, sorting, presets, marked Unmapped groups, and Product details.
- [ ] Ordinary Product analytics complete within two seconds against the seeded ten-year expected dataset on the target computer.

