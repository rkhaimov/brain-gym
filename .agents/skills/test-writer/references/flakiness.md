# Flakiness

## Reproduce before fixing

Run the reported browser test on the current code before diagnosing or changing it. Record the case, failure, and exact
command. A failure that cannot be reproduced is not evidence for a speculative synchronization change.

Use the project flaky checker:

```shell
node .agents/skills/test-writer/scripts/flaky-check.mjs 10 --project browser <test-file>
```

The script reuses the prebuilt application bundle and prints failing-run output. Stop early when the target failure is
reproduced.

## Two-phase stability check

1. Run the focused case or suite 10 consecutive times to check isolation stability.
2. Run every related browser suite 5 consecutive times to check shared-state stability.

Only a case passing both phases is stable. When unrelated cases fail randomly during phase two, ask whether to mark
them flaky or expand the fix scope.

If the report does not reproduce, double the run count once. Report the unsuccessful reproduction and request direction
before declaring the case fixed.

## Fixing and marking

Fix the root cause at the shared runner, route operation, generated mock, or interaction boundary when it can prevent
the same failure class. Re-run both phases after the focused suite passes.

Mark a case flaky only when the user directly requests it or supplies a concrete flaky failure. Add the configured
`flaky` tag and a short adjacent reason:

```typescript
test('shows the saved Product', { tags: ['flaky'] }, async () => {
  // scenario
});
```
