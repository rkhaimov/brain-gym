import { expect } from 'vitest';
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
import type { Outlet } from '@/shared/gen/ceramics/v1/outlet_pb.js';
import { screenshot } from '@/test/browser/runtime/screenshot.js';
import { test } from '@/test/browser/runtime/test.js';

test.describe('Outlet maintenance', () => {
  test('creates a no-code Outlet and completes its name, code, and archive lifecycle', async ({
    outletService,
  }) => {
    let outlet: Outlet | undefined;
    outletService.listOutlets.handler.mockImplementation(async (request) =>
      createListOutletsResponseStub({
        outlets: outlet === undefined || outlet.archived !== request.archived ? [] : [outlet],
      }),
    );
    outletService.createOutlet.handler.mockImplementation(async (request) => {
      outlet = createOutletStub({
        archived: false,
        code: request.code,
        id: 'outlet-id',
        name: request.name,
      });
      return createCreateOutletResponseStub({
        result: { case: 'success', value: outlet },
      });
    });
    outletService.updateOutlet.handler.mockImplementation(async (request) => {
      outlet = createOutletStub({
        archived: outlet?.archived ?? false,
        code: request.code,
        id: request.id,
        name: request.name,
      });
      return createUpdateOutletResponseStub({
        result: { case: 'success', value: outlet },
      });
    });
    outletService.setOutletArchived.handler.mockImplementation(async (request) => {
      if (outlet === undefined) throw new Error('Expected an Outlet');
      outlet = createOutletStub({ ...outlet, archived: request.archived });
      return createSetOutletArchivedResponseStub({
        result: { case: 'success', value: outlet },
      });
    });

    const outlets = createOutletsPage();
    await outlets.open();
    await expect.element(outlets.navigation()).toHaveAttribute('aria-current', 'page');
    await outlets.openCreateDialog();
    await outlets.name().fill('Гончарная лавка');
    await expect.element(outlets.code()).toHaveValue('');
    await outlets.create();

    await expect(outletService.createOutlet.getLastRequest()).resolves.toMatchObject({
      name: 'Гончарная лавка',
    });
    expect((await outletService.createOutlet.getLastRequest()).code).toBeUndefined();
    await expect.element(outlets.outlet('Гончарная лавка')).toBeVisible();
    await expect.element(outlets.noCode()).toBeVisible();
    await outlets.screenshotPage('Outlet without code');

    await outlets.openEditDialog('Гончарная лавка');
    await outlets.editName().fill('Новая гончарная лавка');
    await outlets.editCode().fill('GL');
    await outlets.save();
    await expect(outletService.updateOutlet.getLastRequest()).resolves.toMatchObject({
      code: 'GL',
      id: 'outlet-id',
      name: 'Новая гончарная лавка',
    });
    await expect.element(outlets.outlet('Новая гончарная лавка')).toBeVisible();
    await expect.element(page.getByText('GL', { exact: true })).toBeVisible();

    await outlets.openEditDialog('Новая гончарная лавка');
    await outlets.editCode().clear();
    await outlets.save();
    expect((await outletService.updateOutlet.getLastRequest()).code).toBeUndefined();
    await expect.element(outlets.noCode()).toBeVisible();

    await outlets.archive('Новая гончарная лавка');
    await expect.element(outlets.outlet('Новая гончарная лавка')).not.toBeInTheDocument();
    await outlets.showArchived();
    await expect.element(outlets.outlet('Новая гончарная лавка')).toBeVisible();
    await outlets.restore('Новая гончарная лавка');
    await outlets.showActive();
    await expect.element(outlets.outlet('Новая гончарная лавка')).toBeVisible();
  });

  test('places an exact code collision on the Outlet code field', async ({ outletService }) => {
    outletService.listOutlets.resolves(createListOutletsResponseStub({ outlets: [] }));
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
