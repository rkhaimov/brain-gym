import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { createClient, createRouterTransport } from '@connectrpc/connect';
import { describe, expect, vi } from 'vitest';

import { OutletService } from '../../shared/gen/ceramics/v1/outlet_pb.js';
import { ReportImportService } from '../../shared/gen/ceramics/v1/report_import_pb.js';
import { ReportListingService } from '../../shared/gen/ceramics/v1/report_listing_pb.js';
import { SalesReportService } from '../../shared/gen/ceramics/v1/sales_report_pb.js';
import { assertSuccess } from '../../test/server/assertions.js';
import { testEnv } from '../../test/server/env.js';
import { test as serverTest } from '../../test/server/test.js';
import { MutationQueue } from '../mutation-queue.js';
import { registerOutletRoutes } from '../outlet/outlet-service.js';
import { registerReportListingRoutes } from '../report-listing/report-listing-service.js';
import { registerSalesReportRoutes } from '../sales-report/sales-report-service.js';
import type { ReportMailbox } from './report-mailbox.js';
import { registerReportImportRoutes } from './report-import-service.js';

const fixturePath = resolve(import.meta.dirname, 'fixtures/current-multiple-outlets.xlsx');
const invalidFixturePath = resolve(import.meta.dirname, 'fixtures/invalid-numeric.xlsx');

const test = serverTest.extend<{
  readonly clients: {
    readonly imports: ReturnType<typeof createClient<typeof ReportImportService>>;
    readonly listings: ReturnType<typeof createClient<typeof ReportListingService>>;
    readonly outlets: ReturnType<typeof createClient<typeof OutletService>>;
    readonly reports: ReturnType<typeof createClient<typeof SalesReportService>>;
  };
  readonly mailbox: {
    account: string;
    scan: ReturnType<typeof vi.fn<ReportMailbox['scan']>>;
  };
}>({
  mailbox: async ({ task: _task }, use) => {
    const source = await readFile(fixturePath);
    await use({
      account: 'creator@yandex.ru',
      scan: vi.fn(async () => ({
        attachments: [{ filename: 'Отчёт по продажам.xlsx', source, uid: 20 }],
        lastScannedUid: 20,
        uidValidity: 10,
      })),
    });
  },
  clients: async ({ database, mailbox }, use) => {
    const mutationQueue = new MutationQueue();
    const dependencies = { database: database.value, env: testEnv, mutationQueue };
    const transport = createRouterTransport((router) => {
      registerOutletRoutes(router, dependencies);
      registerReportListingRoutes(router, dependencies);
      registerSalesReportRoutes(router, dependencies);
      registerReportImportRoutes(router, { ...dependencies, mailbox });
    });
    await use({
      imports: createClient(ReportImportService, transport),
      listings: createClient(ReportListingService, transport),
      outlets: createClient(OutletService, transport),
      reports: createClient(SalesReportService, transport),
    });
  },
});

describe('Yandex Mail Report import', () => {
  test('imports a complete mailbox batch and advances its cursor', async ({ clients, mailbox }) => {
    const archived = await clients.outlets.createOutlet({ name: 'Москва-4' });
    assertSuccess(archived);
    await clients.outlets.setOutletArchived({ archived: true, id: archived.result.value.id });

    const imported = await clients.imports.importNewReportFiles({});

    expect(imported.result).toMatchObject({
      case: 'success',
      value: {
        createdOutletCount: 1,
        createdReportCount: 2,
        createdReportListingCount: 2,
        importedFileCount: 1,
      },
    });
    expect(await clients.outlets.listOutlets({ archived: false })).toMatchObject({
      outlets: [{ name: 'Пестеля' }],
    });
    expect(await clients.outlets.listOutlets({ archived: true })).toMatchObject({
      outlets: [{ id: archived.result.value.id, name: 'Москва-4' }],
    });

    const activeOutlets = await clients.outlets.listOutlets({ archived: false });
    const activeOutlet = activeOutlets.outlets[0];
    expect(activeOutlet).toBeDefined();
    if (activeOutlet === undefined) throw new Error('Imported Outlet is missing');
    const activeReports = await clients.reports.listSalesReports({
      outletId: activeOutlet.id,
    });
    const archivedReports = await clients.reports.listSalesReports({
      outletId: archived.result.value.id,
    });
    expect(activeReports.reports).toHaveLength(1);
    expect(archivedReports.reports).toHaveLength(1);
    expect((await clients.listings.listReportListings({})).listings).toHaveLength(2);

    mailbox.scan.mockResolvedValueOnce({
      attachments: [],
      lastScannedUid: 25,
      uidValidity: 10,
    });
    const repeated = await clients.imports.importNewReportFiles({});
    expect(repeated.result).toMatchObject({
      case: 'success',
      value: { createdReportCount: 0, importedFileCount: 0 },
    });
    expect(mailbox.scan).toHaveBeenLastCalledWith({ lastScannedUid: 20, uidValidity: 10 });
  });

  test('rejects the complete batch and leaves the cursor unchanged when one workbook is invalid', async ({
    clients,
    mailbox,
  }) => {
    const [validSource, invalidSource] = await Promise.all([
      readFile(fixturePath),
      readFile(invalidFixturePath),
    ]);
    mailbox.scan.mockResolvedValueOnce({
      attachments: [
        { filename: 'Отчёт по продажам 1.xlsx', source: validSource, uid: 20 },
        { filename: 'Отчёт по продажам 2.xlsx', source: invalidSource, uid: 21 },
      ],
      lastScannedUid: 21,
      uidValidity: 10,
    });

    const response = await clients.imports.importNewReportFiles({});

    expect(response.result).toMatchObject({
      case: 'failure',
      value: {
        attachmentName: 'Отчёт по продажам 2.xlsx',
        location: 'D7',
        message: 'ожидалось целое неотрицательное число: Кол',
      },
    });
    expect((await clients.outlets.listOutlets({})).outlets).toHaveLength(0);
    expect((await clients.listings.listReportListings({})).listings).toHaveLength(0);
    expect((await clients.reports.listSalesReports({})).reports).toHaveLength(0);

    mailbox.scan.mockResolvedValueOnce({ attachments: [], lastScannedUid: 21, uidValidity: 10 });
    await clients.imports.importNewReportFiles({});
    expect(mailbox.scan).toHaveBeenLastCalledWith(undefined);
  });

  test('fails safely when INBOX UIDVALIDITY changes', async ({ clients, mailbox }) => {
    await clients.imports.importNewReportFiles({});
    mailbox.scan.mockResolvedValueOnce({ attachments: [], lastScannedUid: 20, uidValidity: 11 });

    const response = await clients.imports.importNewReportFiles({});

    expect(response.result).toMatchObject({
      case: 'failure',
      value: {
        message: 'Яндекс изменил идентификатор INBOX. Автоматический повторный импорт остановлен.',
      },
    });
    const outlets = await clients.outlets.listOutlets({});
    const reportCounts = await Promise.all(
      outlets.outlets.map(
        async (outlet) =>
          (await clients.reports.listSalesReports({ outletId: outlet.id })).reports.length,
      ),
    );
    expect(reportCounts.reduce((total, count) => total + count, 0)).toBe(2);
  });

  test('fails safely when the configured mailbox account changes', async ({ clients, mailbox }) => {
    await clients.imports.importNewReportFiles({});
    const scanCalls = mailbox.scan.mock.calls.length;
    mailbox.account = 'other@yandex.ru';

    const response = await clients.imports.importNewReportFiles({});

    expect(response.result).toMatchObject({
      case: 'failure',
      value: { message: 'Настроен другой почтовый ящик. Сбросьте состояние импорта вручную.' },
    });
    expect(mailbox.scan).toHaveBeenCalledTimes(scanCalls);
  });

  test('imports a resent workbook again when it arrives under a newer UID', async ({
    clients,
    mailbox,
  }) => {
    await clients.imports.importNewReportFiles({});
    const source = await readFile(fixturePath);
    mailbox.scan.mockResolvedValueOnce({
      attachments: [{ filename: 'Отчёт по продажам.xlsx', source, uid: 21 }],
      lastScannedUid: 21,
      uidValidity: 10,
    });

    const response = await clients.imports.importNewReportFiles({});

    expect(response.result).toMatchObject({
      case: 'success',
      value: {
        createdOutletCount: 0,
        createdReportCount: 2,
        createdReportListingCount: 0,
        importedFileCount: 1,
      },
    });
    const outlets = await clients.outlets.listOutlets({});
    const reportCounts = await Promise.all(
      outlets.outlets.map(
        async (outlet) =>
          (await clients.reports.listSalesReports({ outletId: outlet.id })).reports.length,
      ),
    );
    expect(reportCounts.reduce((total, count) => total + count, 0)).toBe(4);
  });

  test('serializes complete import clicks', async ({ clients, mailbox }) => {
    let releaseFirstScan: (() => void) | undefined;
    mailbox.scan.mockImplementationOnce(
      async () =>
        await new Promise((resolveScan) => {
          releaseFirstScan = () =>
            resolveScan({ attachments: [], lastScannedUid: 20, uidValidity: 10 });
        }),
    );
    mailbox.scan.mockResolvedValueOnce({ attachments: [], lastScannedUid: 21, uidValidity: 10 });

    const firstImport = clients.imports.importNewReportFiles({});
    await vi.waitFor(() => expect(mailbox.scan).toHaveBeenCalledTimes(1));
    const secondImport = clients.imports.importNewReportFiles({});
    await Promise.resolve();
    expect(mailbox.scan).toHaveBeenCalledTimes(1);

    releaseFirstScan?.();
    await expect(firstImport).resolves.toMatchObject({ result: { case: 'success' } });
    await expect(secondImport).resolves.toMatchObject({ result: { case: 'success' } });
    expect(mailbox.scan).toHaveBeenLastCalledWith({ lastScannedUid: 20, uidValidity: 10 });
  });
});
