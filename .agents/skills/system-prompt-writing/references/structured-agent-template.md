# Structured Agent Template

Use this template when the user requests a `structured` agent.

A `structured` agent is not able to *ask* clarifying questions. It only produces the best effort result using output
schema definition.

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
- Complete the requested task using only provided inputs and rules.

# Examples

Include only examples matching the exact target task shape and decision policy.
Do not include examples with incompatible schemas or different decision policies.

# Input Data

Selected input schema identifier.

# Output Format

Selected output schema identifier.
Return only schema-conformant output.

If required fields are missing or conflicting, return the best valid result allowed by the schema and include explicit
missing-information signaling in the designated output fields.
````
