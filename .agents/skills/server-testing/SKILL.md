---
name: server-testing
description: Server service tests and boundary types. Use when writing or reviewing Node server tests, service fixtures, or types that adapt generated RPC or database models at a server boundary.
---

# Server testing

Test behavior through the public service interface and keep the fixture lifecycle no broader than the behavior requires.

## Result narrowing

Use runtime assertions that also narrow discriminated result unions. Reuse a shared assertion such as `assertSuccess` from `src/test/server/assertions.ts` when multiple tests need the same narrowing; keep scenario assertions in the test.

## Fixture lifecycle

Use the existing client and database lifetime for ordinary service behavior. Restart or reopen infrastructure only when survival across that boundary is the behavior under test.

## Assertion scope

Assert the smallest response shape that proves the scenario. Follow identity across lifecycle operations with `id`, and assert state transitions with their status field. Repeat names or unrelated fields only when their preservation or change is part of the behavior.

## Boundary types

Treat generated RPC and database models as the field source of truth. Derive boundary types with `Pick`, `Omit`, and narrow intersections; add handwritten fields only for domain refinements the generated types cannot express.
