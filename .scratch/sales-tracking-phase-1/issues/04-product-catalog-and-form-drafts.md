# 04: Complete the Product catalog and form drafts

**What to build:** Complete Product maintenance and protect unfinished Product form work. The creator can rename, archive, and restore Products without losing history, and can recover unsubmitted form values after navigation, refresh, or application restart.

**Blocked by:** 02: Establish deterministic browser testing.

**Status:** ready-for-agent

- [ ] The Product catalog distinguishes active and archived Products and hides archived Products from ordinary new selections by default.
- [ ] The creator can rename a Product while preserving its immutable identity.
- [ ] Creating or renaming uses exact string uniqueness across active and archived Products without case, whitespace, punctuation, or spelling normalization.
- [ ] The creator can archive and restore a Product; the application offers no physical Product deletion.
- [ ] Every view of a Product, including future historical views, resolves its current canonical name.
- [ ] A reusable Form facility owns browser-local draft parsing, persistence, restoration, stale-write protection, and clearing.
- [ ] Each form supplies only a stable draft key and structural schema; structurally invalid stored data is ignored safely.
- [ ] Changed form data is stored approximately every five seconds and during page close using synchronous browser storage.
- [ ] Each stored draft carries a request timestamp, and an older write cannot replace a newer draft.
- [ ] Product create and edit drafts restore after refresh or application restart.
- [ ] A draft is cleared only after confirmed save or an explicit Clear action; ordinary navigation or cancel does not silently discard it.
- [ ] Server integration tests cover Product lifecycle, exact-name collisions, and archive restoration against real SQLite.
- [ ] Prebuilt-client integration tests cover Product rename, archive/restore filters, draft restoration, confirmed-save cleanup, and explicit clearing.

