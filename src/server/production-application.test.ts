import { expect } from 'vitest';

import { test } from '../test/server/local-application.js';
import { startProductionApplication } from './production-application.js';

test('opens the browser only after the production application is ready', async ({
  localApplication,
}) => {
  let openedUrl: string | undefined;

  const server = await startProductionApplication({
    browser: {
      async open(url) {
        openedUrl = url;
        const response = await fetch(url);
        expect(response.status).toBe(200);
        await expect(response.text()).resolves.toBe(localApplication.clientHtml);
      },
    },
    clientDirectory: localApplication.clientDirectory,
    dataDirectory: localApplication.dataDirectory,
    port: 0,
    reportMailbox: localApplication.emptyMailbox,
  });
  try {
    expect(openedUrl).toBe(server.url);
  } finally {
    await server.close();
  }
});
