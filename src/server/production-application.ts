import type { ReportMailbox } from './report-import/report-mailbox.js';
import { startApplicationServer } from './application-server.js';
import type { RunningApplicationServer } from './application-server.js';

export interface ApplicationBrowser {
  open(url: string): Promise<void>;
}

export interface ProductionApplicationOptions {
  readonly browser: ApplicationBrowser;
  readonly clientDirectory: string;
  readonly dataDirectory: string;
  readonly port?: number;
  readonly reportMailbox?: ReportMailbox;
}

export async function startProductionApplication(
  options: ProductionApplicationOptions,
): Promise<RunningApplicationServer> {
  const server = await startApplicationServer({
    clientDirectory: options.clientDirectory,
    dataDirectory: options.dataDirectory,
    ...(options.port === undefined ? {} : { port: options.port }),
    ...(options.reportMailbox === undefined ? {} : { reportMailbox: options.reportMailbox }),
  });
  try {
    await options.browser.open(server.url);
    return server;
  } catch (error) {
    await server.close();
    throw error;
  }
}
