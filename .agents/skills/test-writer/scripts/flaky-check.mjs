#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';

const [runsArgument, ...vitestArguments] = process.argv.slice(2);
const runs = Number(runsArgument);

if (!Number.isSafeInteger(runs) || runs < 1 || vitestArguments.length === 0) {
  process.stderr.write('Usage: flaky-check.mjs <runs> <vitest-options...>\n');
  process.exit(2);
}

let failed = false;
for (let run = 1; run <= runs; run += 1) {
  process.stdout.write(`\n[flaky-check] Run ${run}/${runs}\n`);
  const result = spawnSync(
    process.execPath,
    [path.resolve('node_modules/vitest/vitest.mjs'), 'run', '--silent=passed-only', ...vitestArguments],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH: '.local/playwright',
        SKIP_FLAKY_TESTS: 'false',
        SKIP_TEST_APPLICATION_BUILD: 'true',
      },
    },
  );
  failed ||= result.status !== 0;
}

process.exitCode = failed ? 1 : 0;
