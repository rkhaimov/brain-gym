# 01: Evaluate effectful types

**What to build:** Compare Effect with small project-owned typed-result/effect abstractions on a
server startup and database-preparation vertical slice, then record whether either approach
simplifies the application enough to justify adoption.

**Blocked by:** None (can start immediately).

**Status:** needs-triage

- [ ] Describe the current vertical slice's interface, expected failures, unexpected failures,
      dependencies, acquired resources, cancellation behavior, and cleanup ordering as the
      baseline.
- [ ] Prototype the same behavior with Effect and with the smallest viable project-owned
      alternative; retain the current implementation as the comparison baseline.
- [ ] Compare typed failure channels, dependency provision, cancellation and interruption,
      resource scopes, stack traces, debugging, test ergonomics, and incremental adoption cost.
- [ ] Verify how each option interoperates with async Node.js libraries, Kysely transactions,
      Connect handlers, generated Protobuf oneofs, React Query mutations, and form submissions.
- [ ] Measure server runtime cost and any client bundle impact rather than assuming the server
      and UI must use the same abstraction.
- [ ] Evaluate whether each candidate creates a deep module interface or merely moves Promise,
      exception, and cleanup mechanics behind a shallow wrapper.
- [ ] Record a decision that selects Effect, selects project-owned abstractions, or retains the
      current style, with explicit adoption seams and reasons.
- [ ] Do not add a production dependency or begin a broad migration before the decision is
      recorded.
