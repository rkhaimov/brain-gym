import { Code, ConnectError } from '@connectrpc/connect';
import { expect, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import {
  createAnalyticsEarningsContributionStub,
  createAnalyticsMetricsStub,
  createAnalyticsOutletOptionStub,
  createAnalyticsOutletFinancialsStub,
  createAnalyticsPeriodBucketStub,
  createAnalyticsProductOptionStub,
  createGetProductAnalyticsResponseStub,
  createProductAnalyticsRowStub,
} from '@/shared/gen/ceramics/v1/analytics_test.js';
import {
  createGetReportImportStatusResponseStub,
  createImportNewReportFilesResponseStub,
  createReportImportFailureStub,
  createReportImportSuccessStub,
} from '@/shared/gen/ceramics/v1/report_import_test.js';
import {
  AnalyticsBucketGranularity,
  type GetProductAnalyticsResponse,
} from '@/shared/gen/ceramics/v1/analytics_pb.js';
import { screenshot } from '@/test/browser/runtime/screenshot.js';
import { test } from '@/test/browser/runtime/test.js';

test.describe('Product analytics dashboard', () => {
  test('opens as the main page with filtered totals, Product ranking, and an Unmapped warning', async ({
    analyticsService,
    reportImportService,
  }) => {
    const outlet = createAnalyticsOutletOptionStub({ id: 'outlet-1', name: 'Гончарная лавка' });
    const secondOutlet = createAnalyticsOutletOptionStub({ id: 'outlet-2', name: 'Тёплая полка' });
    const product = createAnalyticsProductOptionStub({ id: 'product-1', name: 'Кольцо' });
    analyticsService.getProductAnalytics.resolves(
      createGetProductAnalyticsResponseStub({
        bucketGranularity: AnalyticsBucketGranularity.WEEK,
        outletFinancials: [
          createAnalyticsOutletFinancialsStub({
            earningsKopecks: 8_000_000,
            outletId: outlet.id,
            outletShareKopecks: 2_000_000,
          }),
          createAnalyticsOutletFinancialsStub({
            earningsKopecks: 4_845_000,
            outletId: secondOutlet.id,
            outletShareKopecks: 1_498_000,
          }),
        ],
        outlets: [outlet, secondOutlet],
        previousPeriodEndDate: '2026-10-09',
        previousPeriodStartDate: '2026-09-10',
        previousPeriodTotals: createAnalyticsMetricsStub({
          currentStockBalance: 340,
          earningsKopecks: 10_000_000,
          outletShareKopecks: 3_000_000,
          unitsSold: 170,
        }),
        products: [product],
        rows: [
          createProductAnalyticsRowStub({
            metrics: createAnalyticsMetricsStub({
              currentStockBalance: 81,
              earningsKopecks: 3_220_000,
              outletShareKopecks: 837_000,
              unitsSold: 46,
            }),
            product,
          }),
        ],
        totals: createAnalyticsMetricsStub({
          currentStockBalance: 319,
          earningsKopecks: 12_845_000,
          outletShareKopecks: 3_498_000,
          unitsSold: 186,
        }),
        trendBuckets: [
          createAnalyticsPeriodBucketStub({
            outletEarnings: [
              createAnalyticsEarningsContributionStub({
                earningsKopecks: 1_500_000,
                outletId: outlet.id,
              }),
              createAnalyticsEarningsContributionStub({
                earningsKopecks: 500_000,
                outletId: secondOutlet.id,
              }),
            ],
            periodEndDate: '2026-10-11',
            periodStartDate: '2026-10-10',
          }),
          createAnalyticsPeriodBucketStub({
            outletEarnings: [
              createAnalyticsEarningsContributionStub({
                earningsKopecks: 2_000_000,
                outletId: outlet.id,
              }),
              createAnalyticsEarningsContributionStub({
                earningsKopecks: 1_000_000,
                outletId: secondOutlet.id,
              }),
            ],
            periodEndDate: '2026-10-18',
            periodStartDate: '2026-10-12',
          }),
          createAnalyticsPeriodBucketStub({
            outletEarnings: [
              createAnalyticsEarningsContributionStub({
                earningsKopecks: 1_500_000,
                outletId: outlet.id,
              }),
              createAnalyticsEarningsContributionStub({
                earningsKopecks: 1_000_000,
                outletId: secondOutlet.id,
              }),
            ],
            periodEndDate: '2026-10-25',
            periodStartDate: '2026-10-19',
          }),
          createAnalyticsPeriodBucketStub({
            outletEarnings: [
              createAnalyticsEarningsContributionStub({
                earningsKopecks: 2_000_000,
                outletId: outlet.id,
              }),
              createAnalyticsEarningsContributionStub({
                earningsKopecks: 1_345_000,
                outletId: secondOutlet.id,
              }),
            ],
            periodEndDate: '2026-11-01',
            periodStartDate: '2026-10-26',
          }),
          createAnalyticsPeriodBucketStub({
            outletEarnings: [
              createAnalyticsEarningsContributionStub({
                earningsKopecks: 1_000_000,
                outletId: outlet.id,
              }),
              createAnalyticsEarningsContributionStub({
                earningsKopecks: 1_000_000,
                outletId: secondOutlet.id,
              }),
            ],
            periodEndDate: '2026-11-08',
            periodStartDate: '2026-11-02',
          }),
        ],
        unmappedListingCount: 2,
      }),
    );
    reportImportService.getReportImportStatus.resolves(
      createGetReportImportStatusResponseStub({ lastSyncedAtMs: undefined }),
    );

    await window.openApplicationRoute('/');

    await expect
      .element(page.getByRole('link', { name: 'Обзор' }))
      .toHaveAttribute('aria-current', 'page');
    await expect.element(page.getByRole('heading', { level: 1, name: 'Обзор' })).toBeVisible();
    await expect.element(page.getByText(/128.?450,00/)).toBeVisible();
    await expect.element(page.getByText('186 шт.', { exact: true })).toBeVisible();
    await expect
      .element(page.getByText('Комиссия магазинов', { exact: true }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByText('Остаток на конец периода', { exact: true }))
      .not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: /^Комиссия: изменение/ })).toBeVisible();
    await expect.element(page.getByRole('button', { name: /^Остаток: изменение/ })).toBeVisible();
    await expect
      .element(page.getByText('По сравнению с предыдущим периодом', { exact: true }))
      .not.toBeInTheDocument();
    await expect.element(page.getByRole('row', { name: /Кольцо/ })).toBeVisible();
    const comparison = page.getByRole('region', { name: 'Сравнение штучек' });
    await expect
      .element(comparison.getByRole('button', { name: 'Сортировать по проданным штукам' }))
      .not.toBeInTheDocument();
    await expect.element(comparison.getByText('46 шт.', { exact: true })).not.toBeInTheDocument();
    await expect
      .element(page.getByRole('alert').getByText(/2 несопоставленные позиции/))
      .toBeVisible();
    await page.viewport(1440, 1600);
    await screenshot(page.getByRole('region', { name: 'Обзор' }), 'Product analytics dashboard');

    await expect(analyticsService.getProductAnalytics.getLastRequest()).resolves.toMatchObject({
      outletIds: [],
      periodEndDate: '2026-11-08',
      periodStartDate: '2026-10-10',
      productIds: [],
    });

    page
      .getByRole('button', { name: /Заработано: изменение/ })
      .element()
      .focus();
    await expect
      .element(page.getByRole('tooltip').getByText(/128.?450,00.*100.?000,00/))
      .toBeVisible();
  });

  test('switches between the Earnings trend and Outlet financial comparison', async ({
    analyticsService,
    reportImportService,
  }) => {
    const warmShelf = createAnalyticsOutletOptionStub({ id: 'warm', name: 'Тёплая полка' });
    const lighthouse = createAnalyticsOutletOptionStub({ id: 'lighthouse', name: 'Маяк' });
    analyticsService.getProductAnalytics.resolves(
      createGetProductAnalyticsResponseStub({
        bucketGranularity: AnalyticsBucketGranularity.WEEK,
        outletFinancials: [
          createAnalyticsOutletFinancialsStub({
            earningsKopecks: 12_450_000,
            outletId: warmShelf.id,
            outletShareKopecks: 4_820_000,
          }),
          createAnalyticsOutletFinancialsStub({
            earningsKopecks: 9_070_000,
            outletId: lighthouse.id,
            outletShareKopecks: 5_630_000,
          }),
        ],
        outlets: [warmShelf, lighthouse],
        previousPeriodTotals: createAnalyticsMetricsStub(),
        products: [],
        rows: [],
        totals: createAnalyticsMetricsStub({ earningsKopecks: 21_520_000 }),
        trendBuckets: [
          createAnalyticsPeriodBucketStub({
            outletEarnings: [
              createAnalyticsEarningsContributionStub({
                earningsKopecks: 5_000_000,
                outletId: warmShelf.id,
              }),
              createAnalyticsEarningsContributionStub({
                earningsKopecks: 3_000_000,
                outletId: lighthouse.id,
              }),
            ],
            periodEndDate: '2026-10-18',
            periodStartDate: '2026-10-12',
          }),
          createAnalyticsPeriodBucketStub({
            outletEarnings: [
              createAnalyticsEarningsContributionStub({
                earningsKopecks: 6_000_000,
                outletId: warmShelf.id,
              }),
              createAnalyticsEarningsContributionStub({
                earningsKopecks: 4_000_000,
                outletId: lighthouse.id,
              }),
            ],
            periodEndDate: '2026-10-25',
            periodStartDate: '2026-10-19',
          }),
        ],
        unmappedListingCount: 0,
      }),
    );
    reportImportService.getReportImportStatus.resolves(
      createGetReportImportStatusResponseStub({ lastSyncedAtMs: undefined }),
    );

    await window.openApplicationRoute('/');

    await expect
      .element(page.getByRole('img', { name: 'Динамика заработка по магазинам' }))
      .toBeVisible();
    await expect
      .element(page.getByRole('img', { name: 'Заработано и комиссия по магазинам' }))
      .not.toBeInTheDocument();
    page.getByRole('img', { name: 'Динамика заработка по магазинам' }).element().focus();
    await expect.element(page.getByText(/Тёплая полка.*50.?000,00/)).toBeVisible();
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(page.getByText(/19\.10\.2026.*25\.10\.2026.*60.?000,00/)).toBeVisible();

    await page.getByRole('tab', { name: 'По магазинам' }).click();

    await expect
      .element(page.getByRole('img', { name: 'Заработано и комиссия по магазинам' }))
      .toBeVisible();
    await expect
      .element(page.getByRole('img', { name: 'Динамика заработка по магазинам' }))
      .not.toBeInTheDocument();
    page.getByRole('img', { name: 'Заработано и комиссия по магазинам' }).element().focus();
    await expect
      .element(page.getByText(/Тёплая полка.*124.?500,00.*48.?200,00.*27,9/))
      .toBeVisible();
    page.getByRole('tab', { name: 'По магазинам' }).element().focus();
    await screenshot(
      page.getByRole('region', { name: 'Графики аналитики' }),
      'Outlet financial comparison chart',
    );
    await page.viewport(720, 900);
    const chartBounds = page
      .getByRole('img', { name: 'Заработано и комиссия по магазинам' })
      .element()
      .getBoundingClientRect();
    const cardBounds = page
      .getByRole('region', { name: 'Графики аналитики' })
      .element()
      .getBoundingClientRect();
    expect(chartBounds.left).toBeGreaterThanOrEqual(cardBounds.left);
    expect(chartBounds.right).toBeLessThanOrEqual(cardBounds.right);
  });

  test('aggregates lower-ranked Outlets as Others in both charts', async ({
    analyticsService,
    reportImportService,
  }) => {
    const outlets = Array.from({ length: 12 }, (_, index) =>
      createAnalyticsOutletOptionStub({ id: `outlet-${index}`, name: `Магазин ${index + 1}` }),
    );
    analyticsService.getProductAnalytics.resolves(
      createGetProductAnalyticsResponseStub({
        bucketGranularity: AnalyticsBucketGranularity.WEEK,
        outletFinancials: outlets.map((outlet, index) =>
          createAnalyticsOutletFinancialsStub({
            earningsKopecks: (12 - index) * 100_000,
            outletId: outlet.id,
            outletShareKopecks: (index + 1) * 200_000,
          }),
        ),
        outlets,
        previousPeriodTotals: createAnalyticsMetricsStub(),
        products: [],
        rows: [],
        totals: createAnalyticsMetricsStub(),
        trendBuckets: [
          createAnalyticsPeriodBucketStub({
            outletEarnings: outlets.map((outlet, index) =>
              createAnalyticsEarningsContributionStub({
                earningsKopecks: (12 - index) * 100_000,
                outletId: outlet.id,
              }),
            ),
            periodEndDate: '2026-11-08',
            periodStartDate: '2026-11-02',
          }),
        ],
        unmappedListingCount: 0,
      }),
    );
    reportImportService.getReportImportStatus.resolves(
      createGetReportImportStatusResponseStub({ lastSyncedAtMs: undefined }),
    );

    await window.openApplicationRoute('/');
    const charts = page.getByRole('region', { name: 'Графики аналитики' });
    await expect.element(charts.getByText('Остальные', { exact: true })).toBeVisible();
    await expect.element(charts.getByText('Магазин 6', { exact: true })).not.toBeInTheDocument();
    charts.getByRole('img', { name: 'Динамика заработка по магазинам' }).element().focus();
    await expect
      .element(charts.getByText(/Остальные.*28.?000,00.*Всего.*78.?000,00/))
      .toBeVisible();

    await charts.getByRole('tab', { name: 'По магазинам' }).click();
    await expect.element(charts.getByText('Остальные', { exact: true })).toBeVisible();
    await expect.element(charts.getByText('Магазин 1', { exact: true })).not.toBeInTheDocument();
    charts.getByRole('img', { name: 'Заработано и комиссия по магазинам' }).element().focus();
    for (let index = 0; index < 10; index += 1) await userEvent.keyboard('{ArrowDown}');
    await expect.element(charts.getByText(/Остальные.*23.?000,00.*6.?000,00.*20,7/)).toBeVisible();
  });

  test('shows loading, empty, and retryable error states', async ({
    analyticsService,
    reportImportService,
  }) => {
    const pending = createDeferred<GetProductAnalyticsResponse>();
    analyticsService.getProductAnalytics.handler.mockImplementation(() => pending.promise);
    reportImportService.getReportImportStatus.resolves(
      createGetReportImportStatusResponseStub({ lastSyncedAtMs: undefined }),
    );

    await window.openApplicationRoute('/');
    await expect.element(page.getByText('Загружаем аналитику…', { exact: true })).toBeVisible();

    pending.resolve(
      createGetProductAnalyticsResponseStub({
        outlets: [],
        previousPeriodTotals: createAnalyticsMetricsStub(),
        products: [],
        rows: [],
        totals: createAnalyticsMetricsStub(),
        unmappedListingCount: 0,
      }),
    );
    await expect
      .element(page.getByText('За выбранный период данных пока нет', { exact: true }))
      .toBeVisible();
    await expect
      .element(page.getByText('За выбранный период финансовых данных пока нет', { exact: true }))
      .toBeVisible();
    await page.getByRole('tab', { name: 'По магазинам' }).click();
    await expect
      .element(page.getByText('За выбранный период финансовых данных пока нет', { exact: true }))
      .toBeVisible();

    analyticsService.getProductAnalytics.rejects(
      new ConnectError('Server unavailable', Code.Unavailable),
    );
    await window.openApplicationRoute('/?from=2026-10-01&to=2026-10-31');
    await expect.element(page.getByText('Не удалось загрузить аналитику')).toBeVisible();

    analyticsService.getProductAnalytics.resolves(
      createGetProductAnalyticsResponseStub({
        outlets: [],
        previousPeriodTotals: createAnalyticsMetricsStub(),
        products: [],
        rows: [],
        totals: createAnalyticsMetricsStub(),
        unmappedListingCount: 0,
      }),
    );
    await page.getByRole('button', { name: 'Повторить' }).click();
    await expect
      .element(page.getByText('За выбранный период данных пока нет', { exact: true }))
      .toBeVisible();
  });

  test('combines searchable Outlet and Product selections with rolling date presets', async ({
    analyticsService,
    reportImportService,
  }) => {
    const moscow = createAnalyticsOutletOptionStub({ id: 'moscow', name: 'Москва-4' });
    const pestelya = createAnalyticsOutletOptionStub({ id: 'pestelya', name: 'Пестеля' });
    const outlets = [moscow, pestelya];
    const products = [
      createAnalyticsProductOptionStub({ id: 'ring', name: 'Кольцо' }),
      createAnalyticsProductOptionStub({ id: 'pendant', name: 'Кулон' }),
    ];
    analyticsService.getProductAnalytics.handler.mockImplementation(async (request) => {
      const earningsKopecks =
        request.outletIds.length > 0 || request.productIds.length > 0 ? 200_000 : 100_000;
      return createGetProductAnalyticsResponseStub({
        bucketGranularity: AnalyticsBucketGranularity.WEEK,
        outletFinancials: [
          createAnalyticsOutletFinancialsStub({
            earningsKopecks,
            outletId: pestelya.id,
            outletShareKopecks: earningsKopecks / 5,
          }),
        ],
        outlets,
        previousPeriodTotals: createAnalyticsMetricsStub(),
        products,
        rows: [],
        totals: createAnalyticsMetricsStub({ earningsKopecks }),
        trendBuckets: [
          createAnalyticsPeriodBucketStub({
            outletEarnings: [
              createAnalyticsEarningsContributionStub({
                earningsKopecks,
                outletId: pestelya.id,
              }),
            ],
            periodEndDate: request.periodEndDate,
            periodStartDate: request.periodStartDate,
          }),
        ],
        unmappedListingCount: 0,
      });
    });
    reportImportService.getReportImportStatus.resolves(
      createGetReportImportStatusResponseStub({ lastSyncedAtMs: undefined }),
    );

    await window.openApplicationRoute('/');
    await page.getByRole('tab', { name: 'По магазинам' }).click();
    page.getByRole('img', { name: 'Заработано и комиссия по магазинам' }).element().focus();
    await expect.element(page.getByText(/Пестеля.*1.?000,00/)).toBeVisible();
    const filters = page.getByRole('region', { name: 'Фильтры аналитики' });
    const period = filters.getByRole('button', { name: 'Выбрать период' });
    const outlet = filters.getByRole('combobox', { name: 'Магазины' });
    await expect.element(period).toBeVisible();
    await expect.element(outlet).toBeVisible();
    const periodLabel = filters.getByText('Период', { exact: true }).element();
    const outletLabel = filters.getByText('Магазины', { exact: true }).element();
    const outletControl = outlet.element().closest('[data-slot="combobox-chips"]');
    if (outletControl === null) throw new Error('Expected the Outlet combobox control');
    expect(periodLabel.getBoundingClientRect().top).toBeCloseTo(
      outletLabel.getBoundingClientRect().top,
      0,
    );
    expect(period.element().getBoundingClientRect().top).toBeCloseTo(
      outletControl.getBoundingClientRect().top,
      0,
    );
    expect(periodLabel.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      period.element().getBoundingClientRect().top,
    );
    expect(
      filters.getByText('Магазины', { exact: true }).element().getBoundingClientRect().bottom,
    ).toBeLessThanOrEqual(outlet.element().getBoundingClientRect().top);
    await page.getByRole('combobox', { name: 'Магазины' }).click();
    await expect.element(page.getByRole('listbox')).toBeVisible();
    expect(
      page
        .getByRole('option')
        .elements()
        .map((element) => element.textContent),
    ).toEqual(['Москва-4', 'Пестеля']);
    await page.getByRole('combobox', { name: 'Магазины' }).fill('пес');
    await page.getByRole('option', { name: 'Пестеля' }).click();
    await page.getByRole('combobox', { name: 'Штучки' }).click();
    await page.getByRole('combobox', { name: 'Штучки' }).fill('кул');
    await page.getByRole('option', { name: 'Кулон' }).click();
    await page.getByRole('button', { name: 'Выбрать период' }).click();
    await page.getByRole('button', { name: 'Последние 7 дней' }).click();

    await expect(analyticsService.getProductAnalytics.getLastRequest()).resolves.toMatchObject({
      outletIds: ['pestelya'],
      periodEndDate: '2026-11-08',
      periodStartDate: '2026-11-02',
      productIds: ['pendant'],
    });
    await expect
      .element(page.getByRole('tab', { name: 'По магазинам' }))
      .toHaveAttribute('data-state', 'active');
    page.getByRole('img', { name: 'Заработано и комиссия по магазинам' }).element().focus();
    await expect.element(page.getByText(/Пестеля.*2.?000,00/)).toBeVisible();
    expect(window.location.search).toContain('outlets');
    expect(window.location.search).toContain('products');
    await expect.element(filters.getByText('Пестеля', { exact: true })).toBeVisible();
    await expect.element(filters.getByText('Кулон', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Очистить магазины' }).click();
    await page.getByRole('button', { name: 'Очистить штучки' }).click();
    await expect(analyticsService.getProductAnalytics.getLastRequest()).resolves.toMatchObject({
      outletIds: [],
      productIds: [],
    });

    await page.getByRole('button', { name: 'Выбрать период' }).click();
    await page.getByRole('button', { name: /^четверг, 5 ноября 2026 г\.$/ }).click();
    await page.getByRole('button', { name: /^воскресенье, 1 ноября 2026 г\.$/ }).click();
    await expect(analyticsService.getProductAnalytics.getLastRequest()).resolves.toMatchObject({
      periodEndDate: '2026-11-05',
      periodStartDate: '2026-11-01',
    });

    await window.openApplicationRoute('/?from=2026-11-08&to=2026-11-01');
    await expect
      .element(page.getByRole('button', { name: 'Выбрать период' }))
      .toHaveTextContent('10.10.2026 — 08.11.2026');

    await window.openApplicationRoute('/?to=2026-01-01');
    await expect
      .element(page.getByRole('button', { name: 'Выбрать период' }))
      .toHaveTextContent('10.10.2026 — 08.11.2026');
  });

  test('calculates a rolling preset from the day it is clicked', async ({
    analyticsService,
    reportImportService,
  }) => {
    analyticsService.getProductAnalytics.resolves(
      createGetProductAnalyticsResponseStub({
        outlets: [],
        previousPeriodTotals: createAnalyticsMetricsStub(),
        products: [],
        rows: [],
        totals: createAnalyticsMetricsStub(),
        unmappedListingCount: 0,
      }),
    );
    reportImportService.getReportImportStatus.resolves(
      createGetReportImportStatusResponseStub({ lastSyncedAtMs: undefined }),
    );

    await window.openApplicationRoute('/');
    vi.setSystemTime(new Date(2026, 10, 9, 12));
    await page.getByRole('button', { name: 'Выбрать период' }).click();
    await page.getByRole('button', { name: 'Последние 7 дней' }).click();

    await expect(analyticsService.getProductAnalytics.getLastRequest()).resolves.toMatchObject({
      periodEndDate: '2026-11-09',
      periodStartDate: '2026-11-03',
    });
  });

  test('ranks Products with presets and sortable visible metric columns', async ({
    analyticsService,
    reportImportService,
  }) => {
    const product = (id: string, name: string) => createAnalyticsProductOptionStub({ id, name });
    analyticsService.getProductAnalytics.resolves(
      createGetProductAnalyticsResponseStub({
        outlets: [],
        previousPeriodTotals: createAnalyticsMetricsStub(),
        products: [],
        rows: [
          createProductAnalyticsRowStub({
            metrics: createAnalyticsMetricsStub({
              currentStockBalance: 2,
              earningsKopecks: 5000,
              outletShareKopecks: 100,
              unitsSold: 10,
            }),
            product: product('ring', 'Кольцо'),
          }),
          createProductAnalyticsRowStub({
            metrics: createAnalyticsMetricsStub({
              currentStockBalance: 10,
              earningsKopecks: 3000,
              outletShareKopecks: 500,
              unitsSold: 20,
            }),
            product: product('pendant', 'Кулон'),
          }),
          createProductAnalyticsRowStub({
            metrics: createAnalyticsMetricsStub({
              currentStockBalance: 1,
              earningsKopecks: 9000,
              outletShareKopecks: 50,
              unitsSold: 5,
            }),
            product: product('brooch', 'Брошь'),
          }),
        ],
        totals: createAnalyticsMetricsStub(),
        unmappedListingCount: 0,
      }),
    );
    reportImportService.getReportImportStatus.resolves(
      createGetReportImportStatusResponseStub({ lastSyncedAtMs: undefined }),
    );

    await window.openApplicationRoute('/');
    const comparison = page.getByRole('region', { name: 'Сравнение штучек' });
    const names = () =>
      comparison
        .getByRole('row')
        .elements()
        .slice(1)
        .map((row) => row.querySelector('td')?.textContent);

    await expect.element(comparison.getByText('Кулон', { exact: true })).toBeVisible();
    await expect.element(comparison.getByText('20 шт.', { exact: true })).not.toBeInTheDocument();
    expect(names()).toEqual(['Кулон', 'Кольцо', 'Брошь']);
    await page.getByRole('button', { name: 'Больше заработано' }).click();
    expect(names()).toEqual(['Брошь', 'Кольцо', 'Кулон']);
    await page.getByRole('button', { name: 'Мало остатка' }).click();
    expect(names()).toEqual(['Брошь', 'Кольцо', 'Кулон']);
    await page.getByRole('button', { name: 'Сортировать по комиссии' }).click();
    expect(names()).toEqual(['Кулон', 'Кольцо', 'Брошь']);
  });

  test('sends Unmapped work to Products and returns to the same analytics period', async ({
    analyticsService,
    reportImportService,
  }) => {
    analyticsService.getProductAnalytics.resolves(
      createGetProductAnalyticsResponseStub({
        outlets: [],
        previousPeriodTotals: createAnalyticsMetricsStub(),
        products: [],
        rows: [],
        totals: createAnalyticsMetricsStub(),
        unmappedListingCount: 1,
      }),
    );
    reportImportService.getReportImportStatus.resolves(
      createGetReportImportStatusResponseStub({ lastSyncedAtMs: undefined }),
    );

    await window.openApplicationRoute('/?from=2026-10-01&to=2026-10-31');
    const callsBeforeMapping = analyticsService.getProductAnalytics.handler.mock.calls.length;
    await page.getByRole('link', { name: 'Сопоставить позиции' }).click();

    await expect
      .element(page.getByRole('tab', { name: /Позиции отчётов/ }))
      .toHaveAttribute('aria-selected', 'true');
    expect(window.location.search).toContain('filter=unmapped');
    expect(window.location.search).toContain('returnTo');
    await page.getByRole('button', { name: 'Вернуться к обзору' }).click();
    await expect.element(page.getByRole('heading', { level: 1, name: 'Обзор' })).toBeVisible();
    expect(window.location.search).toContain('from=2026-10-01');
    expect(window.location.search).toContain('to=2026-10-31');
    expect(analyticsService.getProductAnalytics.handler.mock.calls.length).toBeGreaterThan(
      callsBeforeMapping,
    );
  });

  test('keeps sync pending and refreshes dashboard numbers after a successful import', async ({
    analyticsService,
    reportImportService,
  }) => {
    const importResult =
      createDeferred<ReturnType<typeof createImportNewReportFilesResponseStub>>();
    const outlet = createAnalyticsOutletOptionStub({ id: 'sync-outlet', name: 'Маяк' });
    reportImportService.importNewReportFiles.handler.mockImplementation(() => importResult.promise);
    analyticsService.getProductAnalytics.handler.mockImplementation(async (request) => {
      const imported = reportImportService.importNewReportFiles.handler.mock.calls.length > 0;
      const earningsKopecks = imported ? 200_000 : 100_000;
      return createGetProductAnalyticsResponseStub({
        bucketGranularity: AnalyticsBucketGranularity.DAY,
        outletFinancials: [
          createAnalyticsOutletFinancialsStub({
            earningsKopecks,
            outletId: outlet.id,
            outletShareKopecks: earningsKopecks / 4,
          }),
        ],
        outlets: [outlet],
        previousPeriodTotals: createAnalyticsMetricsStub(),
        products: [],
        rows: [],
        totals: createAnalyticsMetricsStub({
          currentStockBalance: 0,
          earningsKopecks,
          outletShareKopecks: earningsKopecks / 4,
          unitsSold: imported ? 2 : 1,
        }),
        trendBuckets: [
          createAnalyticsPeriodBucketStub({
            outletEarnings: [
              createAnalyticsEarningsContributionStub({
                earningsKopecks,
                outletId: outlet.id,
              }),
            ],
            periodEndDate: request.periodEndDate,
            periodStartDate: request.periodEndDate,
          }),
        ],
        unmappedListingCount: 0,
      });
    });
    reportImportService.getReportImportStatus.resolves(
      createGetReportImportStatusResponseStub({
        lastSyncedAtMs: new Date(2026, 10, 7, 9, 30).getTime(),
      }),
    );

    await window.openApplicationRoute('/?from=2026-11-01&to=2026-11-08');
    await expect.element(page.getByText('1 шт.', { exact: true })).toBeVisible();
    await page.getByRole('tab', { name: 'По магазинам' }).click();
    page.getByRole('img', { name: 'Заработано и комиссия по магазинам' }).element().focus();
    await expect.element(page.getByText(/Маяк.*1.?000,00/)).toBeVisible();
    const syncButton = page
      .getByRole('region', { name: 'Отчёты из Яндекс Почты' })
      .getByRole('button');
    await syncButton.click();
    await expect.element(syncButton).toBeDisabled();
    await expect.element(syncButton).toHaveTextContent('Загружаем отчёты…');

    importResult.resolve(
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

    await expect.element(page.getByText('Отчёты загружены', { exact: true })).toBeVisible();
    await expect.element(page.getByText('2 шт.', { exact: true })).toBeVisible();
    await expect
      .element(page.getByRole('tab', { name: 'По магазинам' }))
      .toHaveAttribute('aria-selected', 'true');
    page.getByRole('img', { name: 'Заработано и комиссия по магазинам' }).element().focus();
    await expect.element(page.getByText(/Маяк.*2.?000,00/)).toBeVisible();
    page.getByRole('tab', { name: 'По магазинам' }).element().focus();
    await screenshot(
      page.getByRole('region', { name: 'Отчёты из Яндекс Почты' }),
      'Successful dashboard mail sync',
    );
    await expect(analyticsService.getProductAnalytics.getLastRequest()).resolves.toMatchObject({
      periodEndDate: '2026-11-08',
      periodStartDate: '2026-11-01',
    });
  });

  test('reports an empty sync and a workbook failure on the dashboard', async ({
    analyticsService,
    reportImportService,
  }) => {
    analyticsService.getProductAnalytics.resolves(
      createGetProductAnalyticsResponseStub({
        outlets: [],
        previousPeriodTotals: createAnalyticsMetricsStub(),
        products: [],
        rows: [],
        totals: createAnalyticsMetricsStub(),
        unmappedListingCount: 0,
      }),
    );
    reportImportService.getReportImportStatus.resolves(
      createGetReportImportStatusResponseStub({ lastSyncedAtMs: undefined }),
    );
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

    await window.openApplicationRoute('/');
    await page.getByRole('button', { name: 'Загрузить отчёты из почты' }).click();
    await expect.element(page.getByText('Новых отчётов нет', { exact: true })).toBeVisible();

    reportImportService.importNewReportFiles.resolves(
      createImportNewReportFilesResponseStub({
        result: {
          case: 'failure',
          value: createReportImportFailureStub({
            attachmentName: 'Отчёт.xlsx',
            location: 'D14',
            message: 'ожидалась неотрицательная сумма',
          }),
        },
      }),
    );
    await page.getByRole('button', { name: 'Загрузить отчёты из почты' }).click();
    await expect.element(page.getByText('Импорт не выполнен', { exact: true })).toBeVisible();
    await expect
      .element(page.getByText(/ожидалась неотрицательная сумма · Отчёт.xlsx · D14/))
      .toBeVisible();
  });
});

function createDeferred<T>() {
  let resolvePromise: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });
  return {
    promise,
    resolve(value: T) {
      resolvePromise?.(value);
    },
  };
}
