# 05: Manage Outlets and Outlet codes

**What to build:** Let the creator maintain the Outlets that hold Products and optionally associate each Outlet with the exact code used by Report files. Outlet identity and history remain stable when its visible name or code changes.

**Blocked by:** 04: Complete the Product catalog and form drafts.

**Status:** ready-for-agent

- [ ] The creator can create an Outlet with a non-empty, exactly unique name.
- [ ] Outlet names remain unique across active and archived Outlets without normalization.
- [ ] An Outlet code is optional, but every non-empty code is exactly unique across Outlets.
- [ ] The creator can add, change, or remove an Outlet code while keeping the same immutable Outlet identity.
- [ ] An Outlet without a code remains available for manual work and later analytics.
- [ ] Changing or removing a code does not rewrite or detach data associated with the Outlet identity.
- [ ] The creator can rename an Outlet and all application views resolve its current name.
- [ ] The creator can archive and restore an Outlet; the application offers no physical Outlet deletion.
- [ ] Archived Outlets are hidden from ordinary new selections while remaining available to historical views.
- [ ] Outlet create and edit forms use the shared draft-restoration and explicit-clear behavior.
- [ ] Server integration tests cover exact name/code collisions, code addition/change/removal, rename, archive, and restore against real SQLite.
- [ ] Prebuilt-client integration tests cover the complete Outlet lifecycle and the no-code state through the injected transport.

