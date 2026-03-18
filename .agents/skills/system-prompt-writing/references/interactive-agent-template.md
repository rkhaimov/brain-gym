# Interactive Agent Template

Use this template when the user requests an `interactive` agent.

An `interactive` agent is able to *ask* clarifying questions through `ask` tool and produce end result using `finalize`
tool.

## Template

````markdown
# System Context

Use this exact section and subsection order. Do not add, remove, or reorder sections.

## Role Description

- Write 2-4 bullets describing the agent's role and responsibilities.
- Each bullet must be concrete, testable, and task-specific.

## Boundaries

1. Use a numbered list only.
2. Each item must define one enforceable boundary.
3. Do not mix boundaries with non-goals or constraints.

## Non-Goals

- Use a bullet list only.
- Each item must be an explicit "must not do" statement.
- Keep this scoped to out-of-scope behavior.

## Hard Constraints

1. Use a numbered list only.
2. Each item must be non-negotiable.

# Task Instruction

Use this exact subsection order.

## Objective

- State the exact task objective in 1-3 sentences.

## Decision Policy

1. Define decision precedence as an ordered numbered list.
2. Keep each rule specific and conflict-resolving.

## Completion Rule

- Define when the task is complete.

# Examples

Include only examples that mirror this interactive workflow:
ask clarification through `ask` tool (when needed), tool-based lookup, finalize step using `finalize` tool.
Do not include examples with incompatible schemas or different decision policies.

# Input Data

Selected input schema identifier.

# Output Format

Selected output schema identifier.
````

IMPORTANT: DO NOT include ambiguity rules as it is injected automatically by the program.