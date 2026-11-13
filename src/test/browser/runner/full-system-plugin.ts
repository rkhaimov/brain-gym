import { request as sendProxyRequest } from 'node:http';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

import type { Plugin } from 'vite';

import type { RunningApplicationServer } from '../../../server/application-server.js';
import { startApplicationServer } from '../../../server/application-server.js';
import type { ReportMailbox } from '../../../server/report-import/report-mailbox.js';

function proxyRequest(
  applicationUrl: string,
  request: IncomingMessage,
  response: ServerResponse,
): void {
  const target = new URL(request.url ?? '/', applicationUrl);
  const proxy = sendProxyRequest(
    target,
    { headers: { ...request.headers, host: target.host }, method: request.method },
    (proxyResponse) => {
      response.statusCode = proxyResponse.statusCode ?? 502;
      for (const [name, value] of Object.entries(proxyResponse.headers)) {
        if (value !== undefined) response.setHeader(name, value);
      }
      proxyResponse.pipe(response);
    },
  );
  proxy.on('error', (error) => {
    if (response.headersSent) {
      response.destroy(error);
      return;
    }
    response.statusCode = 502;
    response.end('Full-system application server is unavailable');
  });
  request.pipe(proxy);
}

export function createFullSystemApplicationPlugin(): Plugin {
  let application: RunningApplicationServer | undefined;
  let temporaryDirectory: string | undefined;

  async function close(): Promise<void> {
    const runningApplication = application;
    const directory = temporaryDirectory;
    application = undefined;
    temporaryDirectory = undefined;
    try {
      await runningApplication?.close();
    } finally {
      if (directory !== undefined) await rm(directory, { force: true, recursive: true });
    }
  }

  async function start(): Promise<void> {
    await close();
    const testRoot = resolve('.local/test-tmp');
    await mkdir(testRoot, { recursive: true });
    temporaryDirectory = await mkdtemp(join(testRoot, 'full-system-'));
    const workbook = await readFile(
      resolve('src/server/report-import/fixtures/current-multiple-outlets.xlsx'),
    );
    const mailbox: ReportMailbox = {
      account: 'creator@yandex.ru',
      async scan(cursor) {
        return cursor === undefined
          ? {
              attachments: [{ filename: 'Отчёт по продажам.xlsx', source: workbook, uid: 20 }],
              lastScannedUid: 20,
              uidValidity: 10,
            }
          : { attachments: [], lastScannedUid: 20, uidValidity: 10 };
      },
    };
    try {
      application = await startApplicationServer({
        dataDirectory: temporaryDirectory,
        port: 0,
        reportMailbox: mailbox,
      });
    } catch (error) {
      await close();
      throw error;
    }
  }

  function finishControlRequest(operation: Promise<void>, response: ServerResponse): void {
    operation.then(
      () => {
        response.statusCode = 204;
        response.end();
      },
      (error: unknown) => {
        response.statusCode = 500;
        response.end(error instanceof Error ? error.message : 'Full-system setup failed');
      },
    );
  }

  return {
    name: 'ceramics-full-system-application',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.method === 'POST' && request.url === '/__full-system/start') {
          finishControlRequest(start(), response);
          return;
        }
        if (request.method === 'POST' && request.url === '/__full-system/stop') {
          finishControlRequest(close(), response);
          return;
        }
        if (request.url?.startsWith('/ceramics.v1.') !== true || application === undefined) {
          next();
          return;
        }
        proxyRequest(application.url, request, response);
      });
    },
    async closeBundle() {
      await close();
    },
  };
}
