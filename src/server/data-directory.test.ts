import { resolve } from 'node:path';

import { describe, expect, test } from 'vitest';

import { resolveApplicationDataDirectory } from './data-directory.js';

describe('resolveApplicationDataDirectory', () => {
  test('resolves a configured relative directory from the working directory', () => {
    const workingDirectory = resolve('test-working-directory');

    expect(resolveApplicationDataDirectory('.local/development', workingDirectory)).toBe(
      resolve(workingDirectory, '.local/development'),
    );
  });

  test.each([undefined, '', '   '])('rejects missing or blank configuration: %s', (configured) => {
    expect(() => resolveApplicationDataDirectory(configured)).toThrow(
      'CERAMICS_DATA_DIR must name the application data directory',
    );
  });
});
