import { expect } from 'vitest';
import type { Mock } from 'vitest';
import { page } from 'vitest/browser';

import {
  createListOutletsResponseStub,
  createOutletStub,
} from '@/shared/gen/ceramics/v1/outlet_test.js';
import {
  createListOutletListingsResponseStub,
  createOutletListingStub,
} from '@/shared/gen/ceramics/v1/outlet_listing_test.js';
import {
  createCreateSalesReportResponseStub,
  createListSalesReportsResponseStub,
  createSalesReportStub,
  createSalesReportSummaryStub,
} from '@/shared/gen/ceramics/v1/sales_report_test.js';
import { screenshot } from '@/test/browser/runtime/screenshot.js';
import { test } from '@/test/browser/runtime/test.js';

const outlet = createOutletStub({
  archived: false,
  code: 'GL',
  id: 'outlet-id',
  name: 'Гончарная лавка',
});
const knownListing = createOutletListingStub({
  currentStockBalance: 5,
  id: 'listing-id',
  lastOutletPriceKopecks: 3500,
  latestUnitsSold: 2,
  name: 'Кольцо',
  outletId: outlet.id,
});

test.describe('Outlet details and manual Sales report', () => {
  test.beforeEach(({ outletListingService, outletService, salesReportService }) => {
    outletService.listOutlets.resolves(createListOutletsResponseStub({ outlets: [outlet] }));
    outletListingService.listOutletListings.resolves(
      createListOutletListingsResponseStub({ listings: [knownListing] }),
    );
    salesReportService.listSalesReports.resolves(
      createListSalesReportsResponseStub({ reports: [] }),
    );
  });

  test('displays the Outlet name, code, and listing summaries', async () => {
    const details = createOutletDetailsPage();
    await window.openApplicationRoute('/outlets');
    await page.getByRole('button', { name: `Открыть ${outlet.name}` }).click();

    await expect.element(page.getByRole('heading', { name: outlet.name })).toBeVisible();
    await expect.element(page.getByText('GL', { exact: true })).toBeVisible();
    await expect.element(page.getByText(knownListing.name, { exact: true })).toBeVisible();
    await expect.element(page.getByText('35,00 ₽')).toBeVisible();
    await expect.element(page.getByText('5', { exact: true })).toBeVisible();
    await details.screenshotPage('Outlet listing summaries');
  });

  test('creates a report from the Outlet page using existing and new listings', async ({
    salesReportService,
  }) => {
    const report = createSalesReportStub({
      id: 'report-id',
      outletId: outlet.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
    });
    salesReportService.createSalesReport.resolves(
      createCreateSalesReportResponseStub({
        result: { case: 'success', value: report },
      }),
    );
    salesReportService.listSalesReports.handler.mockImplementation(async () =>
      createListSalesReportsResponseStub({
        reports: called(salesReportService.createSalesReport.handler)
          ? [
              createSalesReportSummaryStub({
                id: report.id,
                listingCount: 2,
                outletId: outlet.id,
                periodEndDate: report.periodEndDate,
                periodStartDate: report.periodStartDate,
              }),
            ]
          : [],
      }),
    );

    const details = createOutletDetailsPage();
    await details.open();
    await details.showReports();
    await details.screenshotPage('Empty Sales report history');
    await details.openCreateReport();
    await details.periodStart().fill('2026-11-01');
    await details.periodEnd().fill('2026-11-30');

    await details.addStock();
    await details.stockListing(0).click();
    await expect.element(page.getByRole('option', { name: knownListing.name })).toBeVisible();
    await details.screenshotDialog('Outlet listing autocomplete');
    await page.getByRole('option', { name: knownListing.name }).click();
    await details.stockBalance(0).fill('5');
    await details.stockPrice(0).fill('35');

    await details.addSale();
    await details.salesListing(0).click();
    await expect.element(page.getByRole('option', { name: knownListing.name })).toBeVisible();
    await details.salesListing(0).fill(' Кольцо ');
    await details.unitsSold(0).fill('2');
    await details.salesValue(0).fill('70');
    await details.earnings(0).fill('60');
    await expect.element(details.outletShare(0)).toHaveTextContent('10,00 ₽');

    await details.addSale();
    await details.salesListing(1).fill('Новая позиция');
    await details.unitsSold(1).fill('1');
    await details.salesValue(1).fill('25');
    await details.earnings(1).fill('20');

    await details.screenshotDialog('Completed Sales report dialog');
    await details.save();

    await expect(salesReportService.createSalesReport.getLastRequest()).resolves.toMatchObject({
      outletId: outlet.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      sales: [
        {
          earningsKopecks: 6000,
          listingName: 'Кольцо',
          salesValueKopecks: 7000,
          unitsSold: 2,
        },
        {
          earningsKopecks: 2000,
          listingName: 'Новая позиция',
          salesValueKopecks: 2500,
          unitsSold: 1,
        },
      ],
      stockBalances: [{ listingName: 'Кольцо', outletPriceKopecks: 3500, stockBalance: 5 }],
    });
    await expect.element(details.dialog()).not.toBeInTheDocument();
    await expect.element(page.getByText('2026-11-01 — 2026-11-30')).toBeVisible();
    await details.screenshotPage('Saved Sales report history');
  });

  test('places validation messages on the fields that caused them', async ({
    salesReportService,
  }) => {
    const details = createOutletDetailsPage();
    await details.open();
    await details.showReports();
    await details.openCreateReport();
    await details.periodStart().fill('2026-11-30');
    await details.periodEnd().fill('2026-11-01');
    await details.addSale();
    await details.salesListing(0).fill('Кольцо');
    await details.salesValue(0).fill('35');
    await details.earnings(0).fill('40');
    await details.addSale();
    await details.salesListing(1).fill(' Кольцо ');
    await details.save();

    await expect.element(details.periodEnd()).toHaveAttribute('aria-invalid', 'true');
    await expect.element(details.salesListing(1)).toHaveAttribute('aria-invalid', 'true');
    await expect.element(details.unitsSold(0)).toHaveAttribute('aria-invalid', 'true');
    await expect.element(details.salesValue(1)).toHaveAttribute('aria-invalid', 'true');
    await expect.element(details.earnings(0)).toHaveAttribute('aria-invalid', 'true');
    await expect.element(details.outletShare(0)).toHaveTextContent('—');
    await expect
      .element(page.getByText('Дата окончания не может быть раньше даты начала'))
      .toBeVisible();
    await expect
      .element(page.getByText('Позиция с таким названием уже добавлена в продажи'))
      .toBeVisible();
    await expect
      .element(page.getByText('Заработано не может превышать сумму продаж'))
      .toBeVisible();
    expect(salesReportService.createSalesReport.handler).not.toHaveBeenCalled();
    await details.screenshotDialog('Sales report field validation');
  });

  test('saves an empty report as zero sales and empty inventory', async ({
    salesReportService,
  }) => {
    salesReportService.createSalesReport.resolves(
      createCreateSalesReportResponseStub({
        result: {
          case: 'success',
          value: createSalesReportStub({ id: 'empty-report-id', outletId: outlet.id }),
        },
      }),
    );
    const details = createOutletDetailsPage();
    await details.open();
    await details.showReports();
    await details.openCreateReport();
    await details.periodStart().fill('2026-11-01');
    await details.periodEnd().fill('2026-11-30');
    await details.save();

    await expect(salesReportService.createSalesReport.getLastRequest()).resolves.toMatchObject({
      sales: [],
      stockBalances: [],
    });
  });
});

function createOutletDetailsPage() {
  const dialog = () => page.getByRole('dialog', { name: 'Новый отчёт' });
  const salesRow = (index: number) =>
    dialog().getByRole('group', { name: `Продажа ${String(index + 1)}` });
  const stockRow = (index: number) =>
    dialog().getByRole('group', { name: `Остаток ${String(index + 1)}` });
  return {
    addSale: () => dialog().getByRole('button', { name: 'Добавить продажу' }).click(),
    addStock: () => dialog().getByRole('button', { name: 'Добавить остаток' }).click(),
    dialog,
    earnings: (index: number) => salesRow(index).getByRole('spinbutton', { name: 'Заработано' }),
    open: () => window.openApplicationRoute(`/outlets/${outlet.id}`),
    openCreateReport: () => page.getByRole('button', { name: 'Создать отчёт' }).click(),
    outletShare: (index: number) => salesRow(index).getByLabelText('Комиссия полки'),
    periodEnd: () => dialog().getByLabelText('Конец периода'),
    periodStart: () => dialog().getByLabelText('Начало периода'),
    salesListing: (index: number) =>
      salesRow(index).getByRole('combobox', { name: 'Позиция полки' }),
    salesValue: (index: number) =>
      salesRow(index).getByRole('spinbutton', { name: 'Сумма продаж' }),
    save: () => dialog().getByRole('button', { name: 'Сохранить отчёт' }).click(),
    screenshotDialog: (name: string) => screenshot(dialog(), name),
    screenshotPage: (name: string) =>
      screenshot(page.getByRole('region', { name: 'Карточка полки' }), name),
    showReports: () => page.getByRole('tab', { name: 'Отчёты' }).click(),
    stockBalance: (index: number) => stockRow(index).getByRole('spinbutton', { name: 'Остаток' }),
    stockListing: (index: number) =>
      stockRow(index).getByRole('combobox', { name: 'Позиция полки' }),
    stockPrice: (index: number) =>
      stockRow(index).getByRole('spinbutton', { name: 'Цена на полке' }),
    unitsSold: (index: number) => salesRow(index).getByRole('spinbutton', { name: 'Продано, шт.' }),
  };
}

function called(mock: Mock): boolean {
  return mock.mock.calls.length > 0;
}
