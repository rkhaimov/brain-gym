# 08: Map Outlet listings to Products

**What to build:** Let the creator associate each Outlet's exact listing names with canonical Products and correct those associations later. Mapping changes reclassify all history immediately while Unmapped listings remain valid and visible.

**Blocked by:** 04: Complete the Product catalog and form drafts; 07: Correct Sales reports and calculate current Stock.

**Status:** ready-for-agent

- [ ] Product mapping identity is the exact pair of Outlet identity and Outlet listing name.
- [ ] A persistent mapping automatically applies when the same exact listing reappears for that Outlet, regardless of Outlet price changes.
- [ ] The creator can map an Outlet listing to an active Product.
- [ ] The creator can create a new Product inline while mapping a listing.
- [ ] The creator can remap a listing or remove its mapping.
- [ ] Mapping, remapping, or unmapping immediately reclassifies every historical and current result for that listing without rewriting Sales reports.
- [ ] An existing mapping remains active when its Product is archived.
- [ ] The listing view supports All, Unmapped, and Mapped filters and defaults to Unmapped when opened from the mapping workflow.
- [ ] Unmapped listings are globally grouped by exact listing-name equality with no case, whitespace, punctuation, or spelling normalization.
- [ ] An Unmapped listing remains distinct from an identically named Product until the creator explicitly maps it.
- [ ] When an exact-name Unmapped group contains listings from several Outlets, each Outlet listing requires its own explicit mapping.
- [ ] No fuzzy, name-derived, or remembered Product suggestion appears in phase one.
- [ ] Server integration tests prove persistent and retroactive mapping, remapping, unmapping, archived-Product behavior, and exact-name grouping.
- [ ] Prebuilt-client integration tests cover filters, inline Product creation, mapping changes, and the visibly distinguished Unmapped state.

