# 08: Map Report listings to Products

**What to build:** Let the creator associate global exact-name Report listings with canonical Products and correct those associations later. Mapping changes reclassify all history immediately while Unmapped listings remain valid and visible.

**Blocked by:** 04: Complete the Product catalog; 07: Correct Sales reports and calculate current Stock.

**Status:** ready-for-agent

- [ ] Product mapping identity is the immutable global Report-listing identity.
- [ ] A persistent mapping automatically applies whenever that Report listing appears at any Outlet, regardless of Outlet price changes.
- [ ] The creator can map a Report listing to an active Product.
- [ ] The creator can create a new Product inline while mapping a listing.
- [ ] The creator can remap a listing or remove its mapping.
- [ ] Mapping, remapping, or unmapping immediately reclassifies every historical and current result for that listing without rewriting Sales reports.
- [ ] An existing mapping remains active when its Product is archived.
- [ ] The listing view supports All, Unmapped, and Mapped filters and defaults to Unmapped when opened from the mapping workflow.
- [ ] Report listing identity uses the trimmed, otherwise exact name with no case, punctuation, or spelling normalization.
- [ ] An Unmapped listing remains distinct from an identically named Product until the creator explicitly maps it.
- [ ] Mapping one Report listing applies to its complete history and every Outlet where it appears.
- [ ] No fuzzy, name-derived, or remembered Product suggestion appears in the MVP.
- [ ] Server integration tests prove persistent and retroactive mapping, cross-Outlet reuse, remapping, unmapping, archived-Product behavior, and exact-name identity.
- [ ] Prebuilt-client integration tests cover filters, inline Product creation, mapping changes, and the visibly distinguished Unmapped state.

## Comments

- 2026-11-12 — Established the prerequisite global Report-listing identity in the unpublished schema and API. Ticket 08 now adds one Product mapping per Report listing rather than one mapping per Outlet–name pair.

