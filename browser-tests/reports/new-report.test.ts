import { expect } from 'vitest';
import { page } from 'vitest/browser';

import {
  createListOutletsResponseStub,
  createOutletStub,
} from '@/shared/gen/ceramics/v1/outlet_test.js';
import {
  createCreateSalesReportResponseStub,
  createSalesReportStub,
} from '@/shared/gen/ceramics/v1/sales_report_test.js';
import { screenshot } from '@/test/browser/runtime/screenshot.js';
import { test } from '@/test/browser/runtime/test.js';

test.describe('Manual Sales report', () => {
  test.beforeEach(({ outletService }) => {
    outletService.listOutlets.resolves(
      createListOutletsResponseStub({
        outlets: [
          createOutletStub({
            archived: false,
            code: undefined,
            id: 'outlet-id',
            name: 'Гончарная лавка',
          }),
        ],
      }),
    );
  });

  test('saves sales and the complete Stock balance with one shared Outlet price', async ({
    salesReportService,
  }) => {
    salesReportService.createSalesReport.resolves(
      createCreateSalesReportResponseStub({
        result: {
          case: 'success',
          value: createSalesReportStub({
            id: 'report-id',
            outletId: 'outlet-id',
            periodEndDate: '2026-11-30',
            periodStartDate: '2026-11-01',
          }),
        },
      }),
    );

    const reports = createNewReportPage();
    await reports.open();
    await reports.selectOutlet('Гончарная лавка');
    await reports.periodStart().fill('2026-11-01');
    await reports.periodEnd().fill('2026-11-30');

    await reports.addStockBalance();
    await reports.stockListing(0).fill('Кольцо');
    await reports.stockBalance(0).fill('5');
    await reports.stockPrice(0).fill('35');

    await reports.addSale();
    await reports.salesListing(0).fill('Кольцо');
    await reports.unitsSold(0).fill('2');
    await reports.earnings(0).fill('60');

    await expect.element(reports.salesPrice(0)).toHaveValue('35');
    await expect.element(reports.outletShare(0)).toHaveTextContent('10,00 ₽');
    await reports.screenshotPage('Completed manual Sales report');
    await reports.save();

    await expect(salesReportService.createSalesReport.getLastRequest()).resolves.toMatchObject({
      outletId: 'outlet-id',
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      sales: [
        {
          earningsKopecks: 6000,
          listingName: 'Кольцо',
          outletPriceKopecks: 3500,
          unitsSold: 2,
        },
      ],
      stockBalances: [{ listingName: 'Кольцо', outletPriceKopecks: 3500, stockBalance: 5 }],
    });
    await expect.element(reports.saved()).toBeVisible();
  });

  test('shows period and duplicate-listing validation before save', async ({
    salesReportService,
  }) => {
    const reports = createNewReportPage();
    await reports.open();
    await reports.selectOutlet('Гончарная лавка');
    await reports.periodStart().fill('2026-11-30');
    await reports.periodEnd().fill('2026-11-01');
    await reports.addSale();
    await reports.salesListing(0).fill('Кольцо');
    await reports.salesPrice(0).fill('35');
    await reports.addSale();
    await reports.salesListing(1).fill('Кольцо');
    await reports.salesPrice(1).fill('35');
    await reports.save();

    await expect
      .element(page.getByText('Дата окончания не может быть раньше даты начала'))
      .toBeVisible();
    await expect
      .element(page.getByText('Позиция с таким названием уже добавлена в продажи'))
      .toBeVisible();
    expect(salesReportService.createSalesReport.handler).not.toHaveBeenCalled();
    await reports.screenshotPage('Manual Sales report validation');
  });

  test('saves an empty report as zero sales and empty inventory', async ({
    salesReportService,
  }) => {
    salesReportService.createSalesReport.resolves(
      createCreateSalesReportResponseStub({
        result: { case: 'success', value: createSalesReportStub({ id: 'empty-report-id' }) },
      }),
    );
    const reports = createNewReportPage();
    await reports.open();
    await reports.selectOutlet('Гончарная лавка');
    await reports.periodStart().fill('2026-11-01');
    await reports.periodEnd().fill('2026-11-30');
    await reports.save();

    await expect(salesReportService.createSalesReport.getLastRequest()).resolves.toMatchObject({
      sales: [],
      stockBalances: [],
    });
    await expect.element(reports.saved()).toBeVisible();
  });
});

function createNewReportPage() {
  const salesRow = (index: number) =>
    page.getByRole('group', { name: `Продажа ${String(index + 1)}` });
  const stockRow = (index: number) =>
    page.getByRole('group', { name: `Остаток ${String(index + 1)}` });
  return {
    addSale: () => page.getByRole('button', { name: 'Добавить продажу' }).click(),
    addStockBalance: () => page.getByRole('button', { name: 'Добавить остаток' }).click(),
    earnings: (index: number) => salesRow(index).getByRole('textbox', { name: 'Заработано' }),
    open: () => window.openApplicationRoute('/reports/new'),
    outletShare: (index: number) => salesRow(index).getByLabelText('Комиссия точки'),
    periodEnd: () => page.getByLabelText('Конец периода'),
    periodStart: () => page.getByLabelText('Начало периода'),
    salesListing: (index: number) =>
      salesRow(index).getByRole('textbox', { name: 'Позиция точки' }),
    salesPrice: (index: number) => salesRow(index).getByRole('textbox', { name: 'Цена в точке' }),
    save: () => page.getByRole('button', { name: 'Сохранить отчёт' }).click(),
    selectOutlet: async (name: string) => {
      await page.getByRole('combobox', { name: 'Торговая точка' }).click();
      await page.getByRole('option', { name }).click();
    },
    saved: () => page.getByText('Отчёт сохранён', { exact: true }),
    screenshotPage: (name: string) => screenshot(page.elementLocator(document.body), name),
    stockBalance: (index: number) => stockRow(index).getByRole('textbox', { name: 'Остаток' }),
    stockListing: (index: number) =>
      stockRow(index).getByRole('textbox', { name: 'Позиция точки' }),
    stockPrice: (index: number) => stockRow(index).getByRole('textbox', { name: 'Цена в точке' }),
    unitsSold: (index: number) => salesRow(index).getByRole('textbox', { name: 'Продано, шт.' }),
  };
}
