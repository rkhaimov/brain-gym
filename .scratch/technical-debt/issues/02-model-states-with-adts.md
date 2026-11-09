# 02: Model states and failures with algebraic data types

**What to build:** Replace ambiguous sentinel values, overlapping optional state, duplicated
transport-result branching, and exception-driven expected failures with focused discriminated
unions at application-owned seams.

**Blocked by:** 01: Evaluate effectful types.

**Status:** needs-triage

- [ ] Inventory server startup, database preparation, backup publication, and Product mutation
      flows for sentinel values, optional-state combinations, string status unions, and expected
      failures currently represented by thrown errors.
- [ ] Define focused algebraic data types only where they make illegal states unrepresentable or
      make required handling exhaustive; do not introduce one universal application `Result`.
- [ ] Keep unexpected infrastructure and programming failures distinct from expected domain and
      workflow outcomes.
- [ ] Preserve generated Protobuf oneofs at the network interface and adapt them once at the
      transport seam when application-owned types provide additional leverage.
- [ ] Make every application-owned union exhaustively matched so a newly added case produces a
      type-checking failure at each required decision point.
- [ ] Prove the approach in server modules first, then adopt it in UI interaction flows only
      where it removes duplicated result unpacking or invalid local state combinations.
- [ ] Preserve network behavior, user-facing validation messages, mutation ordering, database
      durability, and retry behavior.
- [ ] Test observable outcomes through the deepened module interfaces and remove tests that only
      exercise superseded shallow wrappers.
