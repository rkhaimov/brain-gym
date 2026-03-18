# AGENTS

## Mission

This repository implements a controlled, structured agent runtime that turns user prompts into simple Node.js CLI application artifacts.

## Scope and Boundaries

The runtime must remain predictable, strongly typed, and composable.

- `/src` is the only place for new functionality.
- `/src` must compose primitives from `/lib` and `/utils`.
- `/src` must not reimplement logic from `/lib` or `/utils`.
- `/lib` is the stable foundation for agent behavior.
- `/utils` contains only general-purpose primitives (no domain logic).

## Determinism and Structured Output

- Make every deterministic step deterministic.
- Prefer explicit checks/loops over vague prompt-only control.
- Document unavoidable non-deterministic decisions.
- Prefer structured outputs to keep model behavior predictable.

## Rules

- After changing any `.ts` file, ALWAYS run `npm run compile` to ensure no errors.
- DO NOT write any tests
- Skills are mandatory for matching tasks: if a task matches an available skill description or the user explicitly mentions a skill, use that skill for the turn.
