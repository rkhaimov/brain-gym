# 03: Manage resource lifetimes with disposables

**What to build:** Give server, database, lock, file-handle, and test-fixture resources explicit
ownership and deterministic cleanup through `Disposable`, `AsyncDisposable`, `using`, `await
using`, or the selected effect system's equivalent.

**Blocked by:** 01: Evaluate effectful types.

**Status:** needs-triage

- [ ] Inventory acquired resources and their owners across application startup, database
      preparation, backup locking, durable file operations, shutdown, and server test fixtures.
- [ ] Choose native explicit resource management or the effect foundation selected by issue 01;
      do not maintain two competing lifetime protocols for the same resource.
- [ ] Expose disposal through small module interfaces and migrate callers so cleanup is scoped to
      acquisition instead of being repeated across `try`/`catch`/`finally` paths.
- [ ] Define and verify partial-acquisition behavior, reverse-order cleanup, repeated shutdown,
      and cleanup failure reporting without masking the primary failure.
- [ ] Preserve the current ordering in which the HTTP server stops before its database closes and
      every filesystem lock and open handle is released.
- [ ] Keep transaction rollback, staged-file removal, failed-backup cleanup, and pre-migration
      restoration as explicit compensating actions rather than treating them as generic disposal.
- [ ] Add interface-level tests for normal disposal, acquisition failure, operation failure,
      cleanup failure, and idempotent application shutdown.
- [ ] Extend the pattern to browser or UI resources only when a concrete resource owner and
      deterministic lifetime exist; ordinary query, mutation, and form state remain with their
      owning libraries.
