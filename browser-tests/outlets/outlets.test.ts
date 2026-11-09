import { expect } from 'vitest';
import type { Mock } from 'vitest';
import { page } from 'vitest/browser';

import {
  createCreateOutletResponseStub,
  createListOutletsResponseStub,
  createOutletMutationFailureStub,
  createOutletStub,
  createSetOutletArchivedResponseStub,
  createUpdateOutletResponseStub,
} from '@/shared/gen/ceramics/v1/outlet_test.js';
import { OutletMutationFailureField } from '@/shared/gen/ceramics/v1/outlet_pb.js';
import { screenshot } from '@/test/browser/runtime/screenshot.js';
import { test } from '@/test/browser/runtime/test.js';

test.describe('Outlet maintenance', () => {
  test.beforeEach(({ outletService }) => {
    outletService.listOutlets.resolves(createListOutletsResponseStub({ outlets: [] }));
  });

  test('displays Outlets with and without codes', async ({ outletService }) => {
    const outletCode = 'GL';
    const codedOutlet = createOutletStub({
      archived: false,
      code: outletCode,
      id: 'coded-outlet-id',
      name: 'Гончарная лавка',
    });
    const codeLessOutlet = createOutletStub({
      archived: false,
      code: undefined,
      id: 'code-less-outlet-id',
      name: 'Керамический дворик',
    });
    outletService.listOutlets.resolves(
      createListOutletsResponseStub({ outlets: [codedOutlet, codeLessOutlet] }),
    );

    const outlets = createOutletsPage();
    await outlets.open();

    await expect.element(outlets.navigation()).toHaveAttribute('aria-current', 'page');
    await expect.element(outlets.outlet(codedOutlet.name)).toBeVisible();
    await expect.element(outlets.outletCode(outletCode)).toBeVisible();
    await expect.element(outlets.outlet(codeLessOutlet.name)).toBeVisible();
    await expect.element(outlets.noCode()).toBeVisible();
    await outlets.screenshotPage('Outlet list');
  });

  test('creates an Outlet without a code', async ({ outletService }) => {
    const outlet = createOutletStub({
      archived: false,
      code: undefined,
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

    await expect.element(outlets.code()).toHaveValue('');
    await outlets.screenshotPage('Create Outlet form');
    await outlets.create();

    const request = await outletService.createOutlet.getLastRequest();
    expect(request).toMatchObject({ name: outlet.name });
    expect(request.code).toBeUndefined();
    await expect.element(outlets.outlet(outlet.name)).toBeVisible();
    await expect.element(outlets.noCode()).toBeVisible();
  });

  test('renames an Outlet and adds its code', async ({ outletService }) => {
    const outletCode = 'GL';
    const outlet = createOutletStub({
      archived: false,
      code: undefined,
      id: 'outlet-id',
      name: 'Гончарная лавка',
    });
    const updatedOutlet = createOutletStub({
      ...outlet,
      code: outletCode,
      name: 'Новая гончарная лавка',
    });
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

    await expect.element(outlets.editName()).toHaveValue(outlet.name);
    await expect.element(outlets.editCode()).toHaveValue('');
    await outlets.editName().fill(updatedOutlet.name);
    await outlets.editCode().fill(outletCode);
    await outlets.screenshotPage('Edit Outlet form');
    await outlets.save();

    await expect(outletService.updateOutlet.getLastRequest()).resolves.toMatchObject({
      code: updatedOutlet.code,
      id: outlet.id,
      name: updatedOutlet.name,
    });
    await expect.element(outlets.outlet(updatedOutlet.name)).toBeVisible();
    await expect.element(outlets.outletCode(outletCode)).toBeVisible();
  });

  test('removes an Outlet code', async ({ outletService }) => {
    const outlet = createOutletStub({
      archived: false,
      code: 'GL',
      id: 'outlet-id',
      name: 'Гончарная лавка',
    });
    const updatedOutlet = createOutletStub({ ...outlet, code: undefined });
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
    await outlets.editCode().clear();
    await outlets.save();

    const request = await outletService.updateOutlet.getLastRequest();
    expect(request.code).toBeUndefined();
    await expect.element(outlets.noCode()).toBeVisible();
  });

  test('archives an Outlet', async ({ outletService }) => {
    const outlet = createOutletStub({
      archived: false,
      id: 'outlet-id',
      name: 'Гончарная лавка',
    });
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

    await expect(outletService.setOutletArchived.getLastRequest()).resolves.toMatchObject({
      archived: true,
      id: outlet.id,
    });
    await expect.element(outlets.outlet(outlet.name)).toBeVisible();
  });

  test('restores an Outlet', async ({ outletService }) => {
    const outlet = createOutletStub({
      archived: true,
      id: 'outlet-id',
      name: 'Гончарная лавка',
    });
    const restoredOutlet = createOutletStub({ ...outlet, archived: false });
    outletService.setOutletArchived.resolves(
      createSetOutletArchivedResponseStub({
        result: { case: 'success', value: restoredOutlet },
      }),
    );
    outletService.listOutlets.handler.mockImplementation(async (request) => {
      const restored = called(outletService.setOutletArchived.handler);
      return createListOutletsResponseStub({
        outlets: request.archived === !restored ? [restored ? restoredOutlet : outlet] : [],
      });
    });

    const outlets = createOutletsPage();
    await outlets.open();
    await outlets.showArchived();
    await outlets.restore(outlet.name);
    await outlets.showActive();

    await expect(outletService.setOutletArchived.getLastRequest()).resolves.toMatchObject({
      archived: false,
      id: outlet.id,
    });
    await expect.element(outlets.outlet(outlet.name)).toBeVisible();
  });

  test('places an exact code collision on the Outlet code field', async ({ outletService }) => {
    outletService.createOutlet.resolves(
      createCreateOutletResponseStub({
        result: {
          case: 'failure',
          value: createOutletMutationFailureStub({
            field: OutletMutationFailureField.CODE,
            message: 'Торговая точка с таким кодом уже существует',
          }),
        },
      }),
    );

    const outlets = createOutletsPage();
    await outlets.open();
    await outlets.openCreateDialog();
    await outlets.name().fill('Гончарная лавка');
    await outlets.code().fill('GL');
    await outlets.create();

    await expect.element(outlets.code()).toHaveAttribute('aria-invalid', 'true');
    await expect
      .element(page.getByText('Торговая точка с таким кодом уже существует'))
      .toBeVisible();
    await outlets.screenshotPage('Outlet code collision');
  });
});

function createOutletsPage() {
  const catalog = () => page.getByRole('region', { name: 'Все торговые точки' });
  const createDialog = () => page.getByRole('dialog', { name: 'Новая торговая точка' });
  const editDialog = () => page.getByRole('dialog', { name: 'Изменить торговую точку' });

  return {
    archive: (name: string) =>
      catalog()
        .getByRole('button', { name: `Архивировать ${name}` })
        .click(),
    code: () => createDialog().getByRole('textbox', { name: 'Код точки' }),
    create: () => createDialog().getByRole('button', { name: 'Создать' }).click(),
    editCode: () => editDialog().getByRole('textbox', { name: 'Код точки' }),
    editName: () => editDialog().getByRole('textbox', { name: 'Название' }),
    name: () => createDialog().getByRole('textbox', { name: 'Название' }),
    navigation: () => page.getByRole('link', { exact: true, name: 'Торговые точки' }),
    noCode: () => page.getByText('Без кода', { exact: true }),
    open: () => window.openApplicationRoute('/outlets'),
    openCreateDialog: () => page.getByRole('button', { name: 'Создать торговую точку' }).click(),
    openEditDialog: (name: string) =>
      catalog()
        .getByRole('button', { name: `Изменить ${name}` })
        .click(),
    outlet: (name: string) => catalog().getByText(name, { exact: true }),
    outletCode: (code: string) => catalog().getByText(code, { exact: true }),
    restore: (name: string) =>
      catalog()
        .getByRole('button', { name: `Восстановить ${name}` })
        .click(),
    save: () => editDialog().getByRole('button', { name: 'Сохранить' }).click(),
    screenshotPage: (name: string) => screenshot(page.elementLocator(document.body), name),
    showActive: () => page.getByRole('button', { name: 'Активные' }).click(),
    showArchived: () => page.getByRole('button', { name: 'Архив' }).click(),
  };
}

function called(mock: Mock): boolean {
  return mock.mock.calls.length > 0;
}
