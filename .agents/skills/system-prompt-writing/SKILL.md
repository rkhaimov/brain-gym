---
name: system-prompt-writing
description: Use this skill when working with system prompts.
---

# System Prompt Writing

Write prompts with this fixed hierarchy:

1. `System Context`
2. `Task Instruction`
3. `Examples`
4. `Input Data`
5. `Output Format`

Keep wording specific and testable. Prefer explicit constraints over vague goals.

## Template Selection Rule

- If the user explicitly says `structured`, use [structured-agent-template.md](references/structured-agent-template.md).
- If the user explicitly says `interactive`, use [interactive-agent-template.md](references/interactive-agent-template.md).
- If runtime wiring is known, infer mode without asking:
  - interactive runtime (ask/finalize tool workflow) -> use interactive template
  - structured runtime (schema-only response format) -> use structured template
- Ask only when mode cannot be inferred from user input or runtime/context.

## Shared Rules

### Chain-of-thought-safe prompting

- Require internal reasoning only.
- Request concise rationale in outputs when justification is needed.
- Do not request hidden chain-of-thought disclosure.

### Few-shot learning

- Add examples only when they match the target task shape.
- Prefer 1-3 high-signal examples over many weak examples.
- Remove examples that introduce different schemas, goals, or decision policies.

### Input/output schema constraints

- Input/Output must be JSON Schema-constrained. The user must specify which schema to include.
- Schema is defined using `zod` and injected via template placeholder.
- If schema identity is missing, request schema selection before finalizing the prompt.
- Schema constraints must not be duplicated in the prompt body because schema is injected at runtime.

## Pitfall Checklist

Check before finalizing:

- Over-engineering: avoid complex multi-stage logic unless required.
- Example pollution: remove examples that do not match the target task.
- Context overflow: keep examples and instructions compact.
- Ambiguous instructions: replace subjective wording with explicit rules.
- Ignoring edge cases: include behavior for missing, invalid, or conflicting input.