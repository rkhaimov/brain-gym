---
name: effective-types
description: Use this skill when working with TypeScript.
---

# Effective Types

Guidance on how to use types efficiently.

## Strict TypeScript Only

- No implicit `any`.
- Avoid type assertions. If one is unavoidable, add a short comment explaining why it is necessary.

## Make Data Flow Explicit

- Encode behavior in function signatures.
- Prefer input/output types that communicate all outcomes.

```ts
import { Either } from '@utils/Either';
import { Failure } from '@utils/Failure';

type NaNFailure = Failure<'NaNFailure', void>;

const parseNumber = (
  input: string
): Either<NaNFailure, number> =>
  Number.isNaN(Number(input))
    ? Either.left({ kind: 'ParseNumberFailure', body: undefined })
    : Either.right(Number(input));
```

## Treat External Data as Untrusted

- Start from `unknown`.
- Validate with guards or `zod` before using values.

## Make Effects Explicit Through Types

- Use `Either` for fallible outcomes.
- Use `Stream<TEmit, TReturn>` for iterable behavior.

## Use `Either` as a General Choice Type

`Either` is not only for errors. It can model valid alternatives.

## Keep Types Precise, Not Overcomplicated

- Types should reveal behavior to readers.
- Avoid niche type-level tricks unless they remove real bugs.
- Prefer clear domain branding over advanced structural constraints.
- Use `readonly` only when the user explicitly requests immutable types/collections.

## Omit Unused generics

Omit/replace generics that are unused:

```typescript
function isEvenArrayBAD<T>(list: T[]): boolean {
  return list.length % 2 === 0;
}

// T is not used so it can be safely omitted
function isEvenArrayGOOD(list: unknown[]): boolean {
  return list.length % 2 === 0;
}
```

## Prefer Explicit Guards

Use explicit guards defined in `@utils/guards` when possible:

```typescript
// Instead of using JS type conversion
if (!element) {}

// Use predefined guards
if (isNil(element)) {}
```
