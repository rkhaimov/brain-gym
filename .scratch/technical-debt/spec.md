# Code Simplification — Typed architecture backlog

Status: needs-triage

## Deferred scope

This initiative explores a server-first simplification of application control flow. States,
expected failures, dependencies, and resource lifetimes should become explicit in types and
sit behind deep module interfaces. The work is incremental rather than an application-wide
rewrite, and no effect framework is selected in advance.

## Goals

1. Choose whether an effect system or small project-owned abstractions provide enough leverage
   to justify changing the current Promise, exception, and manual-cleanup style.
2. Represent meaningful application states and expected failures with focused algebraic data
   types so invalid combinations are difficult to construct and matching is exhaustive.
3. Give acquired resources explicit ownership and deterministic cleanup without confusing
   disposal with transactional rollback or durable-file compensation.
4. Prove each pattern in server startup and database modules before carrying it into UI code.

## Implementation decisions

- Start with an evidence-gathering vertical slice through server startup and database
  preparation. Compare Effect with small project-owned typed-result/effect abstractions and the
  current implementation before adding a runtime dependency.
- Prefer deep modules with small interfaces at concrete seams. Do not introduce a universal
  `Result` helper, wrapper layer, or hypothetical adapter unless the evaluation demonstrates
  leverage across multiple callers and tests.
- Preserve Protobuf oneofs at the network interface. If application-owned algebraic data types
  are adopted, convert to them once at the transport seam instead of spreading generated
  transport shapes through UI modules.
- Adopt UI patterns only where the server pilot demonstrates a clear reduction in duplicated
  state or failure handling. Continue using React Query and form-library state where those
  modules already own the relevant effects.
- Preserve current durability, cleanup ordering, shutdown idempotency, observable network
  behavior, and user-facing errors throughout any later migration.
- Treat disposal as resource lifetime management. Transaction rollback, staged-file cleanup,
  backup restoration, and other compensating actions retain their domain-specific semantics.

## Sequencing

1. Evaluate the effectful type foundation and record the decision.
2. Model states and expected failures with focused algebraic data types using the selected
   foundation.
3. Standardize resource lifetime management using native disposables or the selected effect
   system's equivalent.
