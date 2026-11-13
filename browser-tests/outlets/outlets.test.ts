import { expect } from 'vitest';
import type { Mock } from 'vitest';
import { page } from 'vitest/browser';

import {
  createCreateOutletResponseStub,
  createListOutletsResponseStub,
  createOutletStub,
  createSetOutletArchivedResponseStub,
  createUpdateOutletResponseStub,
} from '@/shared/gen/ceramics/v1/outlet_test.js';
import {
  createImportNewReportFilesResponseStub,
  createReportImportFailureStub,
  createReportImportSuccessStub,
} from '@/shared/gen/ceramics/v1/report_import_test.js';
import { screenshot } from '@/test/browser/runtime/screenshot.js';
import { test } from '@/test/browser/runtime/test.js';

test.describe('Outlet maintenance', () => {
  test.beforeEach(({ outletService }) => {
    outletService.listOutlets.resolves(createListOutletsResponseStub({ outlets: [] }));
  });

  test('places mail import above the Outlet catalog', async ({ outletService }) => {
    const outlet = createOutletStub({
      archived: false,
      id: 'outlet-id',
      name: 'Гончарная лавка',
    });
    outletService.listOutlets.resolves(createListOutletsResponseStub({ outlets: [outlet] }));

    const outlets = createOutletsPage();
    await outlets.open();

    await expect.element(outlets.navigation()).toHaveAttribute('aria-current', 'page');
    await expect.element(outlets.outlet(outlet.name)).toBeVisible();
    const position = outlets
      .importPanel()
      .element()
      .compareDocumentPosition(outlets.catalog().element());
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    await outlets.screenshotPage('Outlet list with mail import');
  });

  test('creates an Outlet', async ({ outletService }) => {
    const outlet = createOutletStub({
      archived: false,
      id: 'outlet-id',
      name: 'Гончарная лавка',
    });
    outletService.createOutlet.resolves(
      createCreateOutletResponseStub({ result: { case: 'success', value: outlet } }),
    );
    outletService.listOutlets.handler.mockImplementation(async () =>
      createListOutletsResponseStub({
        outlets: called(outletService.createOutlet.handler) ? [outlet] : [],
      }),
    );

    const outlets = createOutletsPage();
    await outlets.open();
    await outlets.openCreateDialog();
    await outlets.name().fill(outlet.name);
    await outlets.screenshotDialog('Create Outlet form');
    await outlets.create();

    await expect(outletService.createOutlet.getLastRequest()).resolves.toMatchObject({
      name: outlet.name,
    });
    await expect.element(outlets.outlet(outlet.name)).toBeVisible();
  });

  test('renames an Outlet', async ({ outletService }) => {
    const outlet = createOutletStub({
      archived: false,
      id: 'outlet-id',
      name: 'Гончарная лавка',
    });
    const updatedOutlet = createOutletStub({ ...outlet, name: 'Новая гончарная лавка' });
    outletService.updateOutlet.resolves(
      createUpdateOutletResponseStub({ result: { case: 'success', value: updatedOutlet } }),
    );
    outletService.listOutlets.handler.mockImplementation(async () =>
      createListOutletsResponseStub({
        outlets: [called(outletService.updateOutlet.handler) ? updatedOutlet : outlet],
      }),
    );

    const outlets = createOutletsPage();
    await outlets.open();
    await outlets.openEditDialog(outlet.name);
    await outlets.editName().fill(updatedOutlet.name);
    await outlets.save();

    await expect(outletService.updateOutlet.getLastRequest()).resolves.toMatchObject({
      id: outlet.id,
      name: updatedOutlet.name,
    });
    await expect.element(outlets.outlet(updatedOutlet.name)).toBeVisible();
  });

  test('archives an Outlet', async ({ outletService }) => {
    const outlet = createOutletStub({ archived: false, id: 'outlet-id', name: 'Гончарная лавка' });
    const archivedOutlet = createOutletStub({ ...outlet, archived: true });
    outletService.setOutletArchived.resolves(
      createSetOutletArchivedResponseStub({
        result: { case: 'success', value: archivedOutlet },
      }),
    );
    outletService.listOutlets.handler.mockImplementation(async (request) => {
      const archived = called(outletService.setOutletArchived.handler);
      return createListOutletsResponseStub({
        outlets: request.archived === archived ? [archived ? archivedOutlet : outlet] : [],
      });
    });

    const outlets = createOutletsPage();
    await outlets.open();
    await outlets.archive(outlet.name);
    await outlets.showArchived();
    await expect.element(outlets.outlet(outlet.name)).toBeVisible();
  });

  test('imports reports, keeps the action pending, and refreshes Outlets', async ({
    outletService,
    reportImportService,
  }) => {
    let resolveImport:
      | ((value: ReturnType<typeof createImportNewReportFilesResponseStub>) => void)
      | undefined;
    reportImportService.importNewReportFiles.handler.mockImplementation(
      async () =>
        await new Promise((resolve) => {
          resolveImport = resolve;
        }),
    );
    const importedOutlet = createOutletStub({ id: 'imported', name: 'Пестеля' });
    outletService.listOutlets.handler.mockImplementation(async () =>
      createListOutletsResponseStub({
        outlets: called(reportImportService.importNewReportFiles.handler) ? [importedOutlet] : [],
      }),
    );

    const outlets = createOutletsPage();
    await outlets.open();
    await outlets.importReports();
    await expect.element(outlets.importButton()).toBeDisabled();
    await expect.element(outlets.importButton()).toHaveTextContent('Загружаем отчёты…');

    resolveImport?.(
      createImportNewReportFilesResponseStub({
        result: {
          case: 'success',
          value: createReportImportSuccessStub({
            createdOutletCount: 1,
            createdReportCount: 2,
            createdReportListingCount: 3,
            importedFileCount: 1,
          }),
        },
      }),
    );
    await expect
      .element(page.getByRole('alert').getByText('Отчёты загружены', { exact: true }))
      .toBeVisible();
    await expect
      .element(
        page
          .getByRole('alert')
          .getByText('Файлов: 1; отчётов: 2; магазинов: 1; позиций: 3.', { exact: true }),
      )
      .toBeVisible();
    await expect.element(outlets.outlet(importedOutlet.name)).toBeVisible();
    expect(await reportImportService.importNewReportFiles.getLastRequest()).toBeDefined();
    await outlets.screenshotImport('Successful mail import');
  });

  test('reports when there are no new files', async ({ reportImportService }) => {
    reportImportService.importNewReportFiles.resolves(
      createImportNewReportFilesResponseStub({
        result: {
          case: 'success',
          value: createReportImportSuccessStub({
            createdOutletCount: 0,
            createdReportCount: 0,
            createdReportListingCount: 0,
            importedFileCount: 0,
          }),
        },
      }),
    );
    const outlets = createOutletsPage();
    await outlets.open();
    await outlets.importReports();

    await expect
      .element(page.getByRole('alert').getByText('Новых отчётов нет', { exact: true }))
      .toBeVisible();
  });

  test('shows a destructive workbook error with its location', async ({ reportImportService }) => {
    reportImportService.importNewReportFiles.resolves(
      createImportNewReportFilesResponseStub({
        result: {
          case: 'failure',
          value: createReportImportFailureStub({
            attachmentName: 'Отчёт по продажам.xlsx',
            location: 'D14',
            message: 'ожидалась неотрицательная сумма',
          }),
        },
      }),
    );
    const outlets = createOutletsPage();
    await outlets.open();
    await outlets.importReports();

    const alert = page.getByRole('alert');
    await expect.element(alert.getByText('Импорт не выполнен', { exact: true })).toBeVisible();
    await expect
      .element(
        alert.getByText('ожидалась неотрицательная сумма · Отчёт по продажам.xlsx · D14', {
          exact: true,
        }),
      )
      .toBeVisible();
    await outlets.screenshotImport('Failed mail import');
  });
});

function createOutletsPage() {
  const catalog = () => page.getByRole('region', { name: 'Все магазины' });
  const createDialog = () => page.getByRole('dialog', { name: 'Новый магазин' });
  const editDialog = () => page.getByRole('dialog', { name: 'Изменить магазин' });
  const importPanel = () => page.getByRole('region', { name: 'Отчёты из Яндекс Почты' });

  return {
    archive: (name: string) =>
      catalog()
        .getByRole('button', { name: `Архивировать ${name}` })
        .click(),
    catalog,
    create: () => createDialog().getByRole('button', { name: 'Создать' }).click(),
    editName: () => editDialog().getByRole('textbox', { name: 'Название' }),
    importButton: () => importPanel().getByRole('button'),
    importPanel,
    importReports: () => importPanel().getByRole('button').click(),
    name: () => createDialog().getByRole('textbox', { name: 'Название' }),
    navigation: () => page.getByRole('link', { exact: true, name: 'Магазины' }),
    open: () => window.openApplicationRoute('/outlets'),
    openCreateDialog: () => page.getByRole('button', { name: 'Создать магазин' }).click(),
    openEditDialog: (name: string) =>
      catalog()
        .getByRole('button', { name: `Изменить ${name}` })
        .click(),
    outlet: (name: string) => catalog().getByText(name, { exact: true }),
    save: () => editDialog().getByRole('button', { name: 'Сохранить' }).click(),
    screenshotDialog: (name: string) => screenshot(page.getByRole('dialog'), name),
    screenshotImport: (name: string) => screenshot(importPanel(), name),
    screenshotPage: (name: string) => screenshot(page.getByRole('main'), name),
    showArchived: () => page.getByRole('button', { name: 'Архив' }).click(),
  };
}

function called(mock: Mock): boolean {
  return mock.mock.calls.length > 0;
}
