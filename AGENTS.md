## Agent skills

### Issue tracker

Issues are tracked as local Markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default five-label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Domain documentation uses the single-context layout. See `docs/agents/domain.md`.

### UI design

UI implementation and visual review use the application identity, logo, color, and icon rules in `docs/ui-design.md`.

### Client module locality

Application-owned UI lives beside its consuming route: keep small private modules in the route file and larger private modules as siblings in its route folder. Promote a module to `src/client/components` only when it serves multiple route pages. Keep generated shadcn primitives in `src/client/components/ui`.
