import { expect, vi } from 'vitest';
import { page } from 'vitest/browser';

import { test } from '@/test/browser/runtime/test.js';

test('imports Report files, maps Products, and shows analytics and current Stock balances', async ({
  realApplication: _realApplication,
}) => {
  vi.setSystemTime(new Date('2026-11-13T09:00:00.000Z'));
  await window.openApplicationRoute('/');

  await page.getByRole('button', { name: 'Загрузить отчёты из почты' }).click();
  await expect.element(page.getByText('Отчёты загружены', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Сопоставить позиции' }).click();

  for (const name of ['Кольцо', 'Кулон']) {
    await page.getByRole('combobox', { name: `Сопоставить ${name}` }).click();
    await page.getByRole('button', { name: 'Создать штучку' }).click();
    const dialog = page.getByRole('dialog', { name: 'Новая штучка' });
    await dialog.getByRole('textbox', { name: 'Название' }).fill(name);
    await dialog.getByRole('button', { name: 'Создать и сопоставить' }).click();
    await expect.element(dialog).not.toBeInTheDocument();
  }

  await page.getByRole('button', { name: 'Вернуться к обзору' }).click();
  await expect
    .element(page.getByRole('group', { name: 'Продано' }).getByText('2 шт.', { exact: true }))
    .toBeVisible();
  await expect
    .element(
      page
        .getByRole('group', { name: 'Заработано' })
        .getByText(/600,00\s*₽/u)
        .first(),
    )
    .toBeVisible();
  await expect
    .element(
      page
        .getByRole('group', { name: 'Комиссия' })
        .getByText(/100,00\s*₽/u)
        .first(),
    )
    .toBeVisible();
  await expect
    .element(page.getByRole('group', { name: 'Остаток' }).getByText('8 шт.', { exact: true }))
    .toBeVisible();

  await page.getByRole('link', { name: 'Магазины' }).click();
  await page.getByRole('button', { name: 'Открыть Пестеля' }).click();
  await expect.element(page.getByRole('row', { name: /Кольцо.*5$/u })).toBeVisible();

  await page.getByRole('link', { name: 'Назад к магазинам' }).click();
  await page.getByRole('button', { name: 'Открыть Москва-4' }).click();
  await expect.element(page.getByRole('row', { name: /Кулон.*3$/u })).toBeVisible();
});
