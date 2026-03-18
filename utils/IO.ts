import { Stream } from '@utils/Stream';

export type IO =
  | { type: 'argv'; onArgv(argv: string[]): void }
  | { type: 'write'; output: string; target: 'stdout' | 'stderr' }
  | { type: 'read'; onRead(input: string): void };

export const IO = {
  /**
   * Returns argv without node and executable.
   *
   * @example
   * // Given process is started with node script.js arg0 arg1="value"
   * const argv = yield* IO.argv() // Returns ['arg0', 'arg1="value"']
   */
  argv: async function* (): Stream<IO, string[]> {
    let onArgv: (input: string[]) => void = () => {};

    const argv = new Promise<string[]>((resolve) => (onArgv = resolve));

    yield { type: 'argv', onArgv };

    return argv;
  },
  read: async function* (): Stream<IO, string> {
    let onRead: (input: string) => void = () => {};

    const read = new Promise<string>((resolve) => (onRead = resolve));

    yield { type: 'read', onRead };

    return read;
  },
  /**
   * Writes given string to stdout. DOES NOT append newline automatically
   */
  write: async function* (
    output: string,
    target: 'stdout' | 'stderr',
  ): Stream<IO, void> {
    yield { type: 'write', target, output };
  },
};
