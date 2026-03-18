import { ExitCode } from '@utils/ExitCode';
import { IO } from '@utils/IO';
import { Stream } from '@utils/Stream';
import assert from 'node:assert';
import tester from 'node:test';

type EmulatedChain = {
  input(value: string): EmulatedChain;
  output(value: string, target: 'stdout' | 'stderr'): EmulatedChain;
  assert(): void;
};

export function describe(description: string, run: () => void) {
  tester.describe(description, run);
}

export function it(description: string, action: EmulatedChain) {
  void tester.it(description, action.assert);
}

type Action =
  | { type: 'input'; value: string }
  | { type: 'output'; value: string; target: 'stdout' | 'stderr' };

export function emulated(
  fn: Stream<IO, ExitCode>,
  config: {
    exit: ExitCode;
    args: string[];
  },
) {
  const actions: Action[] = [];

  const result: EmulatedChain = {
    input: (value) => {
      actions.push({ type: 'input', value });

      return result;
    },
    output: (value, target) => {
      actions.push({ type: 'output', value, target });

      return result;
    },
    assert: async () => {
      while (true) {
        const iter = await fn.next();

        if (iter.done) {
          assert.strictEqual(
            iter.value,
            config.exit,
            `Exit code does not match (expected ${config.exit} received ${iter.value})`,
          );

          return;
        }

        if (iter.value.type === 'argv') {
          iter.value.onArgv(config.args);

          continue;
        }

        const handler = actions.shift();

        assert(
          handler !== undefined,
          `Unexpected IO action ${JSON.stringify(iter.value)}`,
        );

        if (handler.type === 'input') {
          assert(
            iter.value.type === 'read',
            `Expected IO.read action, received ${iter.value}`,
          );

          iter.value.onRead(handler.value);

          continue;
        }

        assert(
          iter.value.type === 'write',
          `Expected IO.write action, received ${iter.value}`,
        );

        assert.strictEqual(handler.target, iter.value.target);
        assert.strictEqual(handler.value, iter.value.output);
      }
    },
  };

  return result;
}
