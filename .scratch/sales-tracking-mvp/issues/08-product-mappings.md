# 08: Map Report listings to Products

**What to build:** Let the creator associate global exact-name Report listings with canonical Products and correct those associations later. Mapping changes reclassify all history immediately while Unmapped listings remain valid and visible.

**Blocked by:** 04: Complete the Product catalog; 07: Correct Sales reports and calculate current Stock.

**Status:** completed

- [x] Product mapping identity is the immutable global Report-listing identity.
- [x] A persistent mapping automatically applies whenever that Report listing appears at any Outlet, regardless of Outlet price changes.
- [x] The creator can map a Report listing to an active Product.
- [x] The creator can create a new Product inline while mapping a listing.
- [x] The creator can remap a listing or remove its mapping.
- [x] Mapping, remapping, or unmapping immediately reclassifies every historical and current result for that listing without rewriting Sales reports.
- [x] An existing mapping remains active when its Product is archived.
- [x] The listing view supports All, Unmapped, and Mapped filters and defaults to Unmapped when opened from the mapping workflow.
- [x] Report listing identity uses the trimmed, otherwise exact name with no case, punctuation, or spelling normalization.
- [x] An Unmapped listing remains distinct from an identically named Product until the creator explicitly maps it.
- [x] Mapping one Report listing applies to its complete history and every Outlet where it appears.
- [x] No fuzzy, name-derived, or remembered Product suggestion appears in the MVP.
- [x] Server integration tests prove persistent and retroactive mapping, cross-Outlet reuse, remapping, unmapping, archived-Product behavior, and exact-name identity.
- [x] Prebuilt-client integration tests cover filters, inline Product creation, mapping changes, and the visibly distinguished Unmapped state.

## Comments

- 2026-11-12 — Established the prerequisite global Report-listing identity in the unpublished schema and API. Ticket 08 now adds one Product mapping per Report listing rather than one mapping per Outlet–name pair.
- 2026-11-12 — Completed in implementation commit `50b40e8`. Verification: `npm run check` passed formatting, lint, typechecking, generated-code verification, 91 tests, and both production builds; real-SQLite integration coverage proves persistence, cross-Outlet reuse, retroactive map/remap/unmap, archived-Product behavior, filtering/counts, and atomic create-and-map. Prebuilt Chromium coverage proves tabs/search state, all filters/counts, substring search, mapping/remapping/unmapping, failure/pending behavior, inline creation and focus sequencing, archived mappings, and Outlet adoption. Representative Outlet, mapping-list, popup, and create-form screenshots were inspected; the important mapping and atomic-create flows were recorded as screencasts. Standards and Spec reviews from fixed point `146574691c98152384b7b3f1562b70089277036b` finished with no remaining findings.

