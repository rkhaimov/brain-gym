import { expect } from 'vitest';

import { test } from '../test/server/local-application.js';
import { startApplicationServer } from './application-server.js';

test('serves the built client and its deep links from a loopback listener', async ({
  localApplication,
}) => {
  const server = await startApplicationServer({
    clientDirectory: localApplication.clientDirectory,
    dataDirectory: localApplication.dataDirectory,
    port: 0,
    reportMailbox: localApplication.emptyMailbox,
  });

  try {
    expect(server.url).toMatch(/^http:\/\/127[.]0[.]0[.]1:\d+$/u);
    await expect(fetch(server.url).then(async (response) => await response.text())).resolves.toBe(
      localApplication.clientHtml,
    );
    await expect(
      fetch(`${server.url}/outlets/imported-outlet`).then(
        async (response) => await response.text(),
      ),
    ).resolves.toBe(localApplication.clientHtml);
  } finally {
    await server.close();
  }
});
