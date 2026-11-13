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
import { screenshot } from '@/test/browser/runtime/screenshot.js';
import { test } from '@/test/browser/runtime/test.js';

test.describe('Outlet maintenance', () => {
  test.beforeEach(({ outletService }) => {
    outletService.listOutlets.resolves(createListOutletsResponseStub({ outlets: [] }));
  });

  test('shows the Outlet catalog without report synchronization controls', async ({
    outletService,
  }) => {
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
    await expect
      .element(page.getByRole('region', { name: 'Отчёты из Яндекс Почты' }))
      .not.toBeInTheDocument();
    await outlets.screenshotPage('Outlet list');
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
});

function createOutletsPage() {
  const catalog = () => page.getByRole('region', { name: 'Все магазины' });
  const createDialog = () => page.getByRole('dialog', { name: 'Новый магазин' });
  const editDialog = () => page.getByRole('dialog', { name: 'Изменить магазин' });

  return {
    archive: (name: string) =>
      catalog()
        .getByRole('button', { name: `Архивировать ${name}` })
        .click(),
    catalog,
    create: () => createDialog().getByRole('button', { name: 'Создать' }).click(),
    editName: () => editDialog().getByRole('textbox', { name: 'Название' }),
    name: () => createDialog().getByRole('textbox', { name: 'Название' }),
    navigation: () => page.getByRole('link', { exact: true, name: 'Магазины' }),
    open: () => window.openApplicationRoute('/outlets'),
    openCreateDialog: () => page.getByRole('button', { name: 'Создать магазин' }).click(),
    openEditDialog: (name: string) =>
      catalog()
        .getByRole('button', { name: `Изменить ${name}` })
        .click(),
    outlet: (name: string) => catalog().getByText(name, { exact: true }),
    table: () => catalog().getByRole('table', { name: 'Магазины' }),
    save: () => editDialog().getByRole('button', { name: 'Сохранить' }).click(),
    screenshotDialog: (name: string) => screenshot(page.getByRole('dialog'), name),
    screenshotPage: (name: string) => screenshot(catalog(), name),
    showArchived: () => page.getByRole('button', { name: 'Архив' }).click(),
  };
}

function called(mock: Mock): boolean {
  return mock.mock.calls.length > 0;
}
