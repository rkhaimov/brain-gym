# 01: Restore unfinished form values

**What to build:** Add shared browser-local recovery for unfinished create and edit form values, including explicit clearing and stale-write protection.

**Status:** needs-triage

- [ ] A reusable Form facility owns browser-local draft parsing, persistence, restoration, stale-write protection, and clearing.
- [ ] Each form supplies only a stable draft key and structural schema.
- [ ] Structurally invalid stored data is ignored safely and cannot block a later valid draft write.
- [ ] Changed form data is stored approximately every five seconds and during page close using synchronous browser storage.
- [ ] Each stored draft carries a request timestamp, and an older write cannot replace a newer structurally valid draft.
- [ ] Product, Outlet, Sales report, and Report-file review forms restore drafts after navigation, refresh, or application restart.
- [ ] A draft is cleared only after confirmed save or an explicit Clear action; ordinary navigation and cancellation do not silently discard it.
- [ ] Report-file drafts store parsed editable values but never store the original Excel binary.
- [ ] Prebuilt-client integration tests cover restoration, confirmed-save cleanup, explicit clearing, malformed stored data, and stale-write protection.
