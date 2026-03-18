import fs from 'node:fs';
import { Tests } from '../../test-writer/schemas';
import { Bundle, Implementation } from '../schemas';

export type BundleHandle = {
  meta: Bundle;
  remove: () => void;
};

export function bundle(
  implementation: Implementation,
  tests: Tests,
): BundleHandle {
  const builtBundle = build(implementation, tests);

  fs.rmSync(OUTPUT_BUNDLE_PATH, { force: true, recursive: true });
  fs.mkdirSync(OUTPUT_BUNDLE_PATH, { recursive: true });

  fs.writeFileSync(builtBundle.main.path, builtBundle.main.source);
  fs.writeFileSync(builtBundle.test.path, builtBundle.test.source);

  return {
    meta: builtBundle,
    remove: () =>
      fs.rmSync(OUTPUT_BUNDLE_PATH, { force: true, recursive: true }),
  };
}

function build(implementation: Implementation, tests: Tests): Bundle {
  return {
    main: {
      path: `${OUTPUT_BUNDLE_PATH}/main.ts`,
      source: implementation.code,
    },
    test: {
      path: `${OUTPUT_BUNDLE_PATH}/tests.ts`,
      source: buildTestSource(tests),
    },
  };
}

function buildTestSource(tests: Tests): string {
  const suits = tests.suits
    .map((suite) => {
      const steps = suite.steps
        .map((step) =>
          step.type === 'input'
            ? `.input(${JSON.stringify(step.input)})`
            : `.output(${JSON.stringify(step.output)}, ${JSON.stringify(step.target)})`,
        )
        .join('');

      const action = `emulated(main(), { exit: ExitCode.create(${suite.exit}), args: ${JSON.stringify(suite.args)} })${steps}`;

      return `  it(${JSON.stringify(suite.description)}, ${action});`;
    })
    .join('\n');

  return `
  import main from './main'
  import { ExitCode } from '@utils/ExitCode';
  import { describe, emulated, it } from '@utils/test';

  describe(${JSON.stringify(tests.description)}, () => {
    ${suits}
  });
  `;
}

const OUTPUT_BUNDLE_PATH = './output';
