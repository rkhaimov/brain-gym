# Prompting

## Provide Context

When you submit a prompt, include context that Codex can use, such as references to relevant files and images

## Provide Test Plans

Codex produces higher-quality outputs when it can verify its work. Include steps to reproduce an issue, validate a
feature, and run linting and pre-commit checks.

## Divide and Conquer

Codex handles complex work better when you break it into smaller, focused steps. Smaller tasks are easier for Codex to
test and for you to review. If you’re not sure how to split a task up, ask Codex to propose a plan.

## Use General Chat

Use them for research, planning, connected-tool workflows

## Use Planning and Interview

Start with /plan and ask Codex to shape it before implementation. You can also ask Codex to interview you and draft a
goal with clear success criteria.

## Prompt Template

* Goal: What are you trying to change or build?
* Context: Which files, folders, docs, examples, or errors matter for this task? You can @ mention certain files as
  context.
* Constraints: What standards, architecture, safety requirements, or conventions should Codex follow?
* Done when: What should be true before the task is complete, such as tests passing, behavior changing, or a bug no
  longer reproducing?

## Tips

https://developers.openai.com/codex/learn/best-practice

# AGENTS.md

> Read by Codex before any work.

Codex loads chain of `AGENTS.md` files down to current context and merges them by inserting blank lines in between.

May include:

* Build and test commands
* Review expectations
* repo-specific conventions
* Directory-specific instructions

> IMPORTANT:
> When incorrect assumptions are made by AI, correct them by updating AGENTS.md

## Setup

* Global scope at `~/.codex`
* Local scope at root `AGENTS.md` or closest to a file at hand `dir/AGENTS.md`
* `AGENTS.override.md` can be defined to override/change rules inside `AGENTS.md` (can be useful for local overrides)
* Fallback names can also be defined for backward compatibility

## Examples

### Global

Global `AGENTS.md` may look like:

```markdown
## Working agreements

- Always run `npm test` after modifying JavaScript files.
- Prefer `pnpm` when installing dependencies.
- Ask for confirmation before adding new production dependencies.
```

### Local

Local `AGENTS.md` may look like:

```markdown
## Repository expectations

- Run `npm run lint` before opening a pull request.
- Document public utilities in `docs/` when you change behavior.
```

## Tips

* Debug current instructions by sending "List the instruction sources you loaded" prompt
* Debug sessions by enabling logging (can be used to examine Codex behavior)
* See more examples at https://agents.md/#examples

# Skills

> https://agentskills.io/home

Useful for:

* Repeatable workflows (release steps, review routines, docs updates)
* Team-specific expertise
* Procedures that need examples, references, or helper scripts

## Setup

Skill consists of:

```text
my-skill/ <- skill name
├── SKILL.md          # Required: metadata + instructions
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation
├── assets/           # Optional: templates, resources
└── ...               # Any additional files or directories
```

Above folder can be placed:

* Global - located at `$HOME/.agents/skills`
* Local - in `$REPO_ROOT/.agents/skills` folder

`agents/openai.yaml` can be used to configure UI metadata, set invocation policy and declare tool dependencies.

## Tips

https://agentskills.io

## Setup

Can be global or local (inside `.agents/skills` folder)

See more examples at https://github.com/openai/plugins/tree/main/plugins/figma

# MCP

Use MCP when AI needs capabilities that live outside the local repo, such as issue trackers, design tools, browsers, or
shared documentation systems.

MCP servers can expose:

* Tools (actions)
* Resources (readable data)
* Prompts (reusable prompt templates)

> IMPORTANT:
> MCP is often most useful when paired with skills.
> A skill defines the workflow and names the MCP tools to use.

## Setup

MCP configuration can be defined globally or locally (inside `.codex/config.toml`).

These server kinds are supported:
* STDIO servers
* Streamable HTTP servers

## Examples

See https://developers.openai.com/codex/mcp#examples-of-useful-mcp-servers

# Plugins

Plugins are the installable distribution unit for reusable skills and apps in Codex. Direct skill folders are best for
local authoring and repo-scoped workflows. If you want to distribute a reusable skill, bundle two or more skills
together, or ship a skill alongside an app integration, package them as a plugin.

Plugins can include one or more skills. They can also optionally bundle app mappings, MCP server configuration, and
presentation assets in a single package.

## Setup

???

# Subagents

You can create different agents with different roles and prompt them to use tools differently. Each subagent stays
focused and uses the right tools for its job.

Subagent workflows help by moving noisy work off the main thread:

* Keep the main agent focused on requirements, decisions, and final outputs.
* Run specialized subagents in parallel for exploration, tests, or log analysis.
* Return summaries from subagents instead of raw intermediate output.

## Setup

???

# Hooks

Hooks allow to alter agent behavior by defining pre/post-processing scripts like PreToolUse, PostToolUse, etc.

Codex plugins can also define custom hooks.

# Workflows

> IMPORTANT:
> Useful reference https://developers.openai.com/codex/workflows

## Explain a Codebase

Notice how prompt provide context and clear steps for an agent to check:
```text
Explain how the request flows through the @file.ts

Include:
- a short summary of the responsibilities of each module involved
- what data is validated and where
- one or two "gotchas" to watch for when changing this

Summarize the request flow as a numbered list of steps. Then list the files involved.
```

## Fix a Bug

Prompt provides context: reproduction steps, constraints and test plan:
```text
Bug: Clicking "Save" on the settings screen sometimes shows "Saved" but doesn't persist the change.

Repro:
1) Start the app: npm run dev
2) Go to /settings
3) Toggle "Enable alerts"
4) Click Save
5) Refresh the page: the toggle resets

Constraints:
- Do not change the API shape.
- Keep the fix minimal and add a regression test if feasible.

Start by reproducing the bug locally, then propose a patch and run checks.

After the fix, run lint + the smallest relevant test suite. Report the commands and results.
```

## Write a Test

```text
Add a test for the invert_list function in @transform.ts. Cover the happy path plus edge cases.

Follow conventions used in other tests.
```

## Screenshot-based Prototype

1) Drag the image file into the terminal to attach it to the prompt.

2) Prompt:

```text
Create a new dashboard based on this image.

Constraints:
- Use react, vite, and tailwind. Write the code in typescript.
- Match spacing, typography, and layout as closely as possible.

Deliverables:
- A new route/page that renders the UI
- Any small components needed
- README.md with instructions to run it locally

Follow design and visual patterns from other files in this project.
```

But what about verification? It seems it is manual only

## Iterate on UI with live updates

1) After running local dev server, prompt:

```text
Propose 2-3 styling improvements for the landing page.
```

2) Pick a direction and iterate with small, specific prompts

```text
Change only the header:
- make the typography more editorial
- increase whitespace
- ensure it still looks good on mobile
```

3) Repeat with focused requests

```text
Next iteration: reduce visual noise.
Keep the layout, but simplify colors and remove any redundant borders.
```

Verification:

* Review changes in the browser “live” as the code is updated.
* Commit changes that you like and revert those that you don’t.
* If you revert or modify a change, tell Codex so it doesn’t overwrite the change when it works on the next prompt.

Mainly manual work, without constraints and with human involved coordination on file freshness

## Do a local code review

Run the review command:

```text
/review Focus on edge cases and security issues
```

Verification:

Apply fixes based on review feedback, then rerun /review to confirm issues are resolved.

## Update documentation

```text
Update the "advanced features" documentation to provide authentication troubleshooting guidance. Verify that all links are valid.
```

Verification:

Read the rendered page.

# Approvals and sandboxing

* Approval determine when Codex pauses for permission before running a command
* The sandbox controls which directories and network access Codex can use

# Notes

## Tips

### Use shortcuts

CTRL + K -> actions menu
prompt $ -> skills
prompt @ -> other methods

Other useful shortcuts available at Settings -> Keyboard shortcuts and https://developers.openai.com/codex/app/commands

## Low priority

* Automations - cron-like jobs for an agent
* Worktrees - isolate work inside repository

## To Try

* In-app browser to develop Storyshots UI https://developers.openai.com/codex/app/browser
* Rules for rejecting npm install commands
* "App" to alter Codex UI behavior (approve screenshots, etc.)
* Build Storyshots skill for Codex (skills for writing stories + mcp for controlling `storyshots`)

https://developers.openai.com/codex/learn/best-practices
https://developers.openai.com/cookbook/topic/codex
