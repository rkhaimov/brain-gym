import { createScreencast } from './screencast.js';
import type { Screencast } from './screencast.js';

interface TestTask {
  readonly name: string;
  readonly suite?: Readonly<{ name: string }>;
}

interface FixtureContext {
  readonly task: TestTask;
}

interface CleanupContext {
  readonly onCleanup: (cleanup: () => Promise<void>) => void;
}

export function screencastFixture(
  { task }: FixtureContext,
  cleanupContext: CleanupContext,
): Screencast {
  const description = task.suite?.name ?? '';
  const filePath = `test-results/${slug(`${description}-${task.name}`)}.webm`;
  const session = createScreencast(filePath, task.name, description);
  cleanupContext.onCleanup(() => session.dispose());
  return session.api;
}

function slug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}
