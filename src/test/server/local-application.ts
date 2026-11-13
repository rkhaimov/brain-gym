import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { test as baseTest } from 'vitest';

import type { ReportMailbox } from '../../server/report-import/report-mailbox.js';

const clientHtml = '<main>Керамика</main>';

const emptyMailbox: ReportMailbox = {
  account: '',
  async scan() {
    return { attachments: [], lastScannedUid: 0, uidValidity: 1 };
  },
};

interface LocalApplicationTestContext {
  readonly clientDirectory: string;
  readonly clientHtml: string;
  readonly dataDirectory: string;
  readonly emptyMailbox: ReportMailbox;
}

export const test = baseTest.extend<{ readonly localApplication: LocalApplicationTestContext }>({
  localApplication: async ({ task: _task }, use) => {
    const testRoot = resolve('.local/test-tmp');
    await mkdir(testRoot, { recursive: true });
    const directory = await mkdtemp(join(testRoot, 'local-application-'));
    const clientDirectory = join(directory, 'client');
    await mkdir(clientDirectory);
    await writeFile(join(clientDirectory, 'index.html'), clientHtml, 'utf8');
    try {
      await use({
        clientDirectory,
        clientHtml,
        dataDirectory: join(directory, 'data'),
        emptyMailbox,
      });
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  },
});
