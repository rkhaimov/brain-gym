import { Code, ConnectError } from '@connectrpc/connect';
import { expect } from 'vitest';
import type { Mock } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { formatRussianDate } from '@/client/lib/localization.js';
import {
  createListOutletsResponseStub,
  createOutletStub,
} from '@/shared/gen/ceramics/v1/outlet_test.js';
import {
  createListProductsResponseStub,
  createProductStub,
} from '@/shared/gen/ceramics/v1/product_test.js';
import {
  createListReportListingsResponseStub,
  createReportListingStub,
  createSetReportListingProductResponseStub,
} from '@/shared/gen/ceramics/v1/report_listing_test.js';
import {
  createCreateSalesReportResponseStub,
  createGetSalesReportResponseStub,
  createListSalesReportsResponseStub,
  createSalesEntryStub,
  createSalesReportStub,
  createSalesReportSummaryStub,
  createSetSalesReportArchivedResponseStub,
  createStockBalanceEntryStub,
  createUpdateSalesReportResponseStub,
} from '@/shared/gen/ceramics/v1/sales_report_test.js';
import type { UpdateSalesReportResponse } from '@/shared/gen/ceramics/v1/sales_report_pb.js';
import { screenshot } from '@/test/browser/runtime/screenshot.js';
import { test } from '@/test/browser/runtime/test.js';

const outlet = createOutletStub({
  archived: false,
  id: 'outlet-id',
  name: 'Гончарная лавка',
});
const ring = createProductStub({ archived: false, id: 'ring-id', name: 'Кольцо' });
const knownListing = createReportListingStub({
  currentStockBalance: 5,
  id: 'listing-id',
  lastOutletPriceKopecks: 3500,
  latestUnitsSold: 2,
  name: 'Кольцо ручной работы',
  product: ring,
});

test.describe('Outlet details and Sales report history', () => {
  test.beforeEach(({ outletService, productService, reportListingService, salesReportService }) => {
    outletService.listOutlets.resolves(createListOutletsResponseStub({ outlets: [outlet] }));
    productService.listProducts.resolves(createListProductsResponseStub({ products: [ring] }));
    reportListingService.listReportListings.resolves(
      createListReportListingsResponseStub({ listings: [knownListing] }),
    );
    salesReportService.listSalesReports.resolves(
      createListSalesReportsResponseStub({ reports: [] }),
    );
  });

  test('displays the Outlet name and listing summaries', async () => {
    const details = createOutletDetailsPage();
    await window.openApplicationRoute('/outlets');
    await page.getByRole('button', { name: `Открыть ${outlet.name}` }).click();

    await expect.element(page.getByRole('heading', { name: outlet.name })).toBeVisible();
    await expect.element(page.getByText(ring.name, { exact: true })).toBeVisible();
    await expect.element(page.getByText(knownListing.name, { exact: true })).toBeVisible();
    await expect.element(page.getByText('35,00 ₽')).toBeVisible();
    await expect.element(page.getByText('5', { exact: true })).toBeVisible();
    await details.screenshotPage('Report listing summaries');
  });

  test('maps an Outlet Report listing without changing its name or metrics', async ({
    reportListingService,
  }) => {
    let listing = createReportListingStub({
      currentStockBalance: 7,
      id: 'unmapped-listing',
      lastOutletPriceKopecks: 4800,
      latestUnitsSold: 3,
      name: 'Кольцо — витрина',
      product: undefined,
    });
    reportListingService.listReportListings.handler.mockImplementation(async () =>
      createListReportListingsResponseStub({ listings: [listing] }),
    );
    reportListingService.setReportListingProduct.handler.mockImplementation(async () => {
      listing = createReportListingStub({ ...listing, product: ring });
      return createSetReportListingProductResponseStub({
        result: { case: 'success', value: listing },
      });
    });

    const details = createOutletDetailsPage();
    await details.open();
    await expect.element(page.getByText(listing.name, { exact: true })).toBeVisible();
    const initialListCallCount = reportListingService.listReportListings.handler.mock.calls.length;
    await page.getByText('Сопоставить', { exact: true }).click();
    await page.getByText(ring.name, { exact: true }).click();

    await expect(
      reportListingService.setReportListingProduct.getLastRequest(),
    ).resolves.toMatchObject({
      productId: ring.id,
      reportListingId: listing.id,
    });
    await expect(reportListingService.listReportListings.getLastRequest()).resolves.toMatchObject({
      outletId: outlet.id,
    });
    expect(reportListingService.listReportListings.handler.mock.calls.length).toBeGreaterThan(
      initialListCallCount,
    );
    await expect.element(page.getByText(ring.name, { exact: true })).toBeVisible();
    await expect.element(page.getByText(listing.name, { exact: true })).toBeVisible();
    await expect.element(page.getByText('48,00 ₽', { exact: true })).toBeVisible();
    await expect.element(page.getByText('3', { exact: true })).toBeVisible();
    await expect.element(page.getByText('7', { exact: true })).toBeVisible();
  });

  test('filters the Outlet report history by archive state', async ({ salesReportService }) => {
    const active = createSalesReportSummaryStub({
      archived: false,
      id: 'active-report',
      outletId: outlet.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
    });
    const archived = createSalesReportSummaryStub({
      archived: true,
      id: 'archived-report',
      outletId: outlet.id,
      periodEndDate: '2026-10-31',
      periodStartDate: '2026-10-01',
    });
    salesReportService.listSalesReports.handler.mockImplementation(async (request) =>
      createListSalesReportsResponseStub({ reports: request.archived ? [archived] : [active] }),
    );

    const details = createOutletDetailsPage();
    await details.open();
    await details.showReports();
    await expect
      .element(details.report(active.periodStartDate, active.periodEndDate))
      .toBeVisible();
    await expect
      .element(details.report(archived.periodStartDate, archived.periodEndDate))
      .not.toBeInTheDocument();

    await details.showArchivedReports();
    await expect
      .element(details.report(active.periodStartDate, active.periodEndDate))
      .not.toBeInTheDocument();
    await expect
      .element(details.report(archived.periodStartDate, archived.periodEndDate))
      .toBeVisible();
    await expect(salesReportService.listSalesReports.getLastRequest()).resolves.toMatchObject({
      archived: true,
      outletId: outlet.id,
    });
    await details.screenshotPage('Archived Sales report history');
  });

  test('shows the current Outlet name with historical reports', async ({
    outletService,
    salesReportService,
  }) => {
    const renamedOutlet = createOutletStub({ ...outlet, name: 'Гончарная лавка на Садовой' });
    outletService.listOutlets.resolves(createListOutletsResponseStub({ outlets: [renamedOutlet] }));
    const report = createSalesReportSummaryStub({
      archived: false,
      id: 'historical-report',
      outletId: outlet.id,
      periodEndDate: '2026-09-30',
      periodStartDate: '2026-09-01',
    });
    salesReportService.listSalesReports.resolves(
      createListSalesReportsResponseStub({ reports: [report] }),
    );

    const details = createOutletDetailsPage();
    await details.open();
    await details.showReports();

    await expect.element(page.getByRole('heading', { name: renamedOutlet.name })).toBeVisible();
    await expect
      .element(details.report(report.periodStartDate, report.periodEndDate))
      .toBeVisible();
  });

  test('opens historical values and edits an active report', async ({ salesReportService }) => {
    const report = createSalesReportStub({
      archived: false,
      id: 'report-id',
      outletId: outlet.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      sales: [
        createSalesEntryStub({
          earningsKopecks: 6000,
          listingName: 'Кольцо',
          outletShareKopecks: 1000,
          salesValueKopecks: 7000,
          unitsSold: 2,
        }),
      ],
      stockBalances: [
        createStockBalanceEntryStub({
          listingName: 'Кольцо',
          outletPriceKopecks: 3500,
          stockBalance: 5,
        }),
      ],
    });
    salesReportService.listSalesReports.resolves(
      createListSalesReportsResponseStub({
        reports: [
          createSalesReportSummaryStub({
            archived: false,
            id: report.id,
            outletId: outlet.id,
            periodEndDate: report.periodEndDate,
            periodStartDate: report.periodStartDate,
          }),
        ],
      }),
    );
    salesReportService.getSalesReport.resolves(
      createGetSalesReportResponseStub({ result: { case: 'success', value: report } }),
    );
    salesReportService.updateSalesReport.resolves(
      createUpdateSalesReportResponseStub({ result: { case: 'success', value: report } }),
    );

    const details = createOutletDetailsPage();
    await details.open();
    await details.showReports();
    await details.openReport(report.periodStartDate, report.periodEndDate);

    await expect.element(details.dialog()).toHaveAccessibleName('Редактировать отчёт');
    await expect.element(details.periodStart()).toHaveValue('01.11.2026');
    await expect.element(details.periodEnd()).toHaveValue('30.11.2026');
    await expect.element(details.salesValue(0)).toHaveValue('70,00');
    await expect.element(details.outletShare(0)).toHaveTextContent('10,00 ₽');
    await expect.element(details.stockPrice(0)).toHaveValue('35,00');
    await details.screenshotDialog('Historical Sales report');

    await details.periodStart().fill('02.11.2026');
    await details.periodEnd().fill('01.12.2026');
    await details.salesListing(0).fill('Серьги');
    await details.unitsSold(0).fill('3');
    await details.salesValue(0).fill('90');
    await details.earnings(0).fill('75');
    await details.stockListing(0).fill('Серьги');
    await details.stockBalance(0).fill('4');
    await details.stockPrice(0).fill('30');
    await details.save();

    await expect(salesReportService.updateSalesReport.getLastRequest()).resolves.toMatchObject({
      id: report.id,
      periodEndDate: '2026-12-01',
      periodStartDate: '2026-11-02',
      sales: [
        {
          earningsKopecks: 7500,
          listingName: 'Серьги',
          salesValueKopecks: 9000,
          unitsSold: 3,
        },
      ],
      stockBalances: [{ listingName: 'Серьги', outletPriceKopecks: 3000, stockBalance: 4 }],
    });
    await expect.element(details.dialog()).not.toBeInTheDocument();
  });

  test('keeps an active report open after an unexpected edit failure', async ({
    salesReportService,
  }) => {
    const report = createSalesReportStub({
      archived: false,
      id: 'report-id',
      outletId: outlet.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      sales: [],
      stockBalances: [],
    });
    salesReportService.listSalesReports.resolves(
      createListSalesReportsResponseStub({
        reports: [
          createSalesReportSummaryStub({
            archived: false,
            id: report.id,
            outletId: outlet.id,
            periodEndDate: report.periodEndDate,
            periodStartDate: report.periodStartDate,
          }),
        ],
      }),
    );
    salesReportService.getSalesReport.resolves(
      createGetSalesReportResponseStub({ result: { case: 'success', value: report } }),
    );
    salesReportService.updateSalesReport.rejects(
      new ConnectError('Server unavailable', Code.Unavailable),
    );

    const details = createOutletDetailsPage();
    await details.open();
    await details.showReports();
    await details.openReport(report.periodStartDate, report.periodEndDate);
    await details.save();

    await expect.element(details.dialog()).toBeVisible();
    await expect
      .element(page.getByText('Не удалось сохранить отчёт. Попробуйте ещё раз.'))
      .toBeVisible();
  });

  test('prevents dismissal while an edit is pending', async ({ salesReportService }) => {
    const report = createSalesReportStub({
      archived: false,
      id: 'report-id',
      outletId: outlet.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      sales: [],
      stockBalances: [],
    });
    salesReportService.listSalesReports.resolves(
      createListSalesReportsResponseStub({
        reports: [
          createSalesReportSummaryStub({
            archived: false,
            id: report.id,
            outletId: outlet.id,
            periodEndDate: report.periodEndDate,
            periodStartDate: report.periodStartDate,
          }),
        ],
      }),
    );
    salesReportService.getSalesReport.resolves(
      createGetSalesReportResponseStub({ result: { case: 'success', value: report } }),
    );
    const pendingUpdate = createDeferred<UpdateSalesReportResponse>();
    salesReportService.updateSalesReport.handler.mockImplementation(() => pendingUpdate.promise);

    const details = createOutletDetailsPage();
    await details.open();
    await details.showReports();
    await details.openReport(report.periodStartDate, report.periodEndDate);
    await details.save();

    await expect
      .element(details.dialog().getByRole('button', { name: 'Сохраняем…' }))
      .toBeVisible();
    await expect.element(details.dialog().getByRole('button', { name: 'Отмена' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await expect.element(details.dialog()).toBeVisible();

    pendingUpdate.resolve(
      createUpdateSalesReportResponseStub({ result: { case: 'success', value: report } }),
    );
    await expect.element(details.dialog()).not.toBeInTheDocument();
  });

  test('opens an archived report read-only and restores it', async ({ salesReportService }) => {
    const report = createSalesReportStub({
      archived: true,
      id: 'archived-report',
      outletId: outlet.id,
      periodEndDate: '2026-10-31',
      periodStartDate: '2026-10-01',
      sales: [
        createSalesEntryStub({
          earningsKopecks: 3000,
          listingName: 'Кулон',
          outletShareKopecks: 500,
          salesValueKopecks: 3500,
          unitsSold: 1,
        }),
      ],
      stockBalances: [
        createStockBalanceEntryStub({
          listingName: 'Кулон',
          outletPriceKopecks: 3500,
          stockBalance: 2,
        }),
      ],
    });
    salesReportService.listSalesReports.handler.mockImplementation(async (request) =>
      createListSalesReportsResponseStub({
        reports:
          request.archived &&
          salesReportService.setSalesReportArchived.handler.mock.calls.length === 0
            ? [
                createSalesReportSummaryStub({
                  archived: true,
                  id: report.id,
                  outletId: outlet.id,
                  periodEndDate: report.periodEndDate,
                  periodStartDate: report.periodStartDate,
                }),
              ]
            : [],
      }),
    );
    salesReportService.getSalesReport.resolves(
      createGetSalesReportResponseStub({ result: { case: 'success', value: report } }),
    );
    salesReportService.setSalesReportArchived.resolves(
      createSetSalesReportArchivedResponseStub({
        result: { case: 'success', value: createSalesReportStub({ ...report, archived: false }) },
      }),
    );

    const details = createOutletDetailsPage();
    await details.open();
    await details.showReports();
    await details.showArchivedReports();
    await details.openReport(report.periodStartDate, report.periodEndDate);

    await expect.element(details.dialog()).toHaveAccessibleName('Просмотр отчёта');
    await expect.element(details.periodStart()).toBeDisabled();
    await expect.element(details.salesValue(0)).toBeDisabled();
    await expect.element(details.stockPrice(0)).toBeDisabled();
    await expect
      .element(details.dialog().getByRole('button', { name: 'Сохранить отчёт' }))
      .not.toBeInTheDocument();
    await details.screenshotDialog('Archived Sales report');

    await details.restoreReport();
    await expect(salesReportService.setSalesReportArchived.getLastRequest()).resolves.toMatchObject(
      {
        archived: false,
        id: report.id,
      },
    );
    await expect.element(details.dialog()).not.toBeInTheDocument();
  });

  test('archives an active report from its history', async ({ salesReportService }) => {
    const summary = createSalesReportSummaryStub({
      archived: false,
      id: 'active-report',
      outletId: outlet.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
    });
    salesReportService.listSalesReports.handler.mockImplementation(async () =>
      createListSalesReportsResponseStub({
        reports:
          salesReportService.setSalesReportArchived.handler.mock.calls.length === 0
            ? [summary]
            : [],
      }),
    );
    salesReportService.setSalesReportArchived.resolves(
      createSetSalesReportArchivedResponseStub({
        result: {
          case: 'success',
          value: createSalesReportStub({ archived: true, id: summary.id, outletId: outlet.id }),
        },
      }),
    );

    const details = createOutletDetailsPage();
    await details.open();
    await details.showReports();
    await details.archiveReport(summary.periodStartDate, summary.periodEndDate);

    await expect(salesReportService.setSalesReportArchived.getLastRequest()).resolves.toMatchObject(
      {
        archived: true,
        id: summary.id,
      },
    );
    await expect
      .element(details.report(summary.periodStartDate, summary.periodEndDate))
      .not.toBeInTheDocument();
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
    await details.periodStart().fill('01.11.2026');
    await details.periodEnd().fill('30.11.2026');

    await details.addStock();
    await details.stockListing(0).click();
    await expect.element(page.getByRole('option', { name: knownListing.name })).toBeVisible();
    await details.screenshotDialog('Report listing autocomplete');
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
      stockBalances: [
        {
          listingName: knownListing.name,
          outletPriceKopecks: 3500,
          stockBalance: 5,
        },
      ],
    });
    await expect.element(details.dialog()).not.toBeInTheDocument();
    await expect.element(page.getByText('01.11.2026 — 30.11.2026')).toBeVisible();
    await details.screenshotPage('Saved Sales report history');
  });

  test('places validation messages on the fields that caused them', async ({
    salesReportService,
  }) => {
    const details = createOutletDetailsPage();
    await details.open();
    await details.showReports();
    await details.openCreateReport();
    await details.periodStart().fill('30.11.2026');
    await details.periodEnd().fill('01.11.2026');
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
    await details.periodStart().fill('01.11.2026');
    await details.periodEnd().fill('30.11.2026');
    await details.save();

    await expect(salesReportService.createSalesReport.getLastRequest()).resolves.toMatchObject({
      sales: [],
      stockBalances: [],
    });
  });
});

function createOutletDetailsPage() {
  const dialog = () => page.getByRole('dialog');
  const periodLabel = (start: string, end: string) =>
    `${formatRussianDate(start)} — ${formatRussianDate(end)}`;
  const salesRow = (index: number) =>
    dialog().getByRole('group', { name: `Продажа ${String(index + 1)}` });
  const stockRow = (index: number) =>
    dialog().getByRole('group', { name: `Остаток ${String(index + 1)}` });
  return {
    addSale: () => dialog().getByRole('button', { name: 'Добавить продажу' }).click(),
    addStock: () => dialog().getByRole('button', { name: 'Добавить остаток' }).click(),
    archiveReport: (start: string, end: string) =>
      page.getByRole('button', { name: `Архивировать отчёт ${periodLabel(start, end)}` }).click(),
    dialog,
    earnings: (index: number) => salesRow(index).getByRole('textbox', { name: 'Заработано' }),
    open: () => window.openApplicationRoute(`/outlets/${outlet.id}`),
    openCreateReport: () => page.getByRole('button', { name: 'Создать отчёт' }).click(),
    openReport: (start: string, end: string) =>
      page.getByRole('button', { name: `Открыть отчёт ${periodLabel(start, end)}` }).click(),
    outletShare: (index: number) => salesRow(index).getByLabelText('Комиссия магазина'),
    periodEnd: () => dialog().getByLabelText('Конец периода'),
    periodStart: () => dialog().getByLabelText('Начало периода'),
    salesListing: (index: number) =>
      salesRow(index).getByRole('combobox', { name: 'Позиция отчёта' }),
    salesValue: (index: number) => salesRow(index).getByRole('textbox', { name: 'Сумма продаж' }),
    save: () => dialog().getByRole('button', { name: 'Сохранить отчёт' }).click(),
    report: (start: string, end: string) =>
      page.getByText(periodLabel(start, end), { exact: true }),
    restoreReport: () => dialog().getByRole('button', { name: 'Восстановить отчёт' }).click(),
    screenshotDialog: (name: string) => screenshot(dialog(), name),
    screenshotPage: (name: string) =>
      screenshot(page.getByRole('region', { name: 'Карточка магазина' }), name),
    showReports: () => page.getByRole('tab', { name: 'Отчёты' }).click(),
    showArchivedReports: () => page.getByRole('button', { name: 'В архиве' }).click(),
    stockBalance: (index: number) => stockRow(index).getByRole('spinbutton', { name: 'Остаток' }),
    stockListing: (index: number) =>
      stockRow(index).getByRole('combobox', { name: 'Позиция отчёта' }),
    stockPrice: (index: number) =>
      stockRow(index).getByRole('textbox', { name: 'Цена в магазине' }),
    unitsSold: (index: number) => salesRow(index).getByRole('spinbutton', { name: 'Продано, шт.' }),
  };
}

function called(mock: Mock): boolean {
  return mock.mock.calls.length > 0;
}

function createDeferred<Value>() {
  let resolvePromise: (value: Value) => void = () => undefined;
  const promise = new Promise<Value>((resolve) => {
    resolvePromise = resolve;
  });
  return { promise, resolve: resolvePromise };
}
