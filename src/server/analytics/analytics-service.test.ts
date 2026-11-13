import { Code, createClient, createRouterTransport } from '@connectrpc/connect';
import { describe, expect } from 'vitest';

import {
  AnalyticsBucketGranularity,
  AnalyticsService,
} from '../../shared/gen/ceramics/v1/analytics_pb.js';
import { OutletService } from '../../shared/gen/ceramics/v1/outlet_pb.js';
import { ProductService } from '../../shared/gen/ceramics/v1/product_pb.js';
import { ReportListingService } from '../../shared/gen/ceramics/v1/report_listing_pb.js';
import { SalesReportService } from '../../shared/gen/ceramics/v1/sales_report_pb.js';
import { assertSuccess } from '../../test/server/assertions.js';
import { testEnv } from '../../test/server/env.js';
import { test as serverTest } from '../../test/server/test.js';
import { MutationQueue } from '../mutation-queue.js';
import { registerOutletRoutes } from '../outlet/outlet-service.js';
import { registerProductRoutes } from '../product/product-service.js';
import { registerReportListingRoutes } from '../report-listing/report-listing-service.js';
import { registerSalesReportRoutes } from '../sales-report/sales-report-service.js';
import { registerAnalyticsRoutes } from './analytics-service.js';

function createClients(database: Parameters<typeof registerAnalyticsRoutes>[1]['database']) {
  const dependencies = { database, env: testEnv, mutationQueue: new MutationQueue() };
  const transport = createRouterTransport((router) => {
    registerAnalyticsRoutes(router, dependencies);
    registerOutletRoutes(router, dependencies);
    registerProductRoutes(router, dependencies);
    registerReportListingRoutes(router, dependencies);
    registerSalesReportRoutes(router, dependencies);
  });
  return {
    analytics: createClient(AnalyticsService, transport),
    listings: createClient(ReportListingService, transport),
    outlets: createClient(OutletService, transport),
    products: createClient(ProductService, transport),
    reports: createClient(SalesReportService, transport),
  };
}

const test = serverTest.extend<{
  readonly clients: ReturnType<typeof createClients>;
}>({
  clients: async ({ database }, use) => {
    await use(createClients(database.value));
  },
});

describe('AnalyticsService', () => {
  test('rejects invalid and reversed calendar ranges', async ({ clients }) => {
    await expect(
      clients.analytics.getProductAnalytics({
        periodEndDate: '2026-11-30',
        periodStartDate: '2026-13-01',
      }),
    ).rejects.toMatchObject({ code: Code.InvalidArgument });
    await expect(
      clients.analytics.getProductAnalytics({
        periodEndDate: '2026-11-01',
        periodStartDate: '2026-11-30',
      }),
    ).rejects.toMatchObject({ code: Code.InvalidArgument });
  });

  test('groups complete reports into clipped ISO weeks and Outlet financial totals', async ({
    clients,
  }) => {
    const warmShelf = await clients.outlets.createOutlet({ name: 'Тёплая полка' });
    const lighthouse = await clients.outlets.createOutlet({ name: 'Маяк' });
    const product = await clients.products.createProduct({ name: 'Кольцо' });
    assertSuccess(warmShelf);
    assertSuccess(lighthouse);
    assertSuccess(product);

    const report = (
      outletId: string,
      periodEndDate: string,
      earningsKopecks: number,
      salesValueKopecks: number,
    ) =>
      clients.reports.createSalesReport({
        outletId,
        periodEndDate,
        periodStartDate: periodEndDate,
        sales: [
          {
            earningsKopecks,
            listingName: 'Кольцо ручной работы',
            salesValueKopecks,
            unitsSold: 1,
          },
        ],
      });
    assertSuccess(await report(warmShelf.result.value.id, '2026-10-11', 1000, 1200));
    assertSuccess(await report(lighthouse.result.value.id, '2026-10-18', 2000, 2500));
    assertSuccess(await report(warmShelf.result.value.id, '2026-10-30', 3000, 3600));
    assertSuccess(await report(lighthouse.result.value.id, '2026-11-08', 4000, 5000));

    const listing = (await clients.listings.listReportListings({})).listings[0];
    if (listing === undefined) throw new Error('Expected a Report listing');
    await clients.listings.setReportListingProduct({
      productId: product.result.value.id,
      reportListingId: listing.id,
    });

    await expect(
      clients.analytics.getProductAnalytics({
        periodEndDate: '2026-11-08',
        periodStartDate: '2026-10-10',
      }),
    ).resolves.toMatchObject({
      bucketGranularity: AnalyticsBucketGranularity.WEEK,
      outletFinancials: [
        {
          earningsKopecks: 4000,
          outletId: warmShelf.result.value.id,
          outletShareKopecks: 800,
        },
        {
          earningsKopecks: 6000,
          outletId: lighthouse.result.value.id,
          outletShareKopecks: 1500,
        },
      ],
      trendBuckets: [
        {
          outletEarnings: [{ earningsKopecks: 1000, outletId: warmShelf.result.value.id }],
          periodEndDate: '2026-10-11',
          periodStartDate: '2026-10-10',
        },
        {
          outletEarnings: [{ earningsKopecks: 2000, outletId: lighthouse.result.value.id }],
          periodEndDate: '2026-10-18',
          periodStartDate: '2026-10-12',
        },
        { outletEarnings: [], periodEndDate: '2026-10-25', periodStartDate: '2026-10-19' },
        {
          outletEarnings: [{ earningsKopecks: 3000, outletId: warmShelf.result.value.id }],
          periodEndDate: '2026-11-01',
          periodStartDate: '2026-10-26',
        },
        {
          outletEarnings: [{ earningsKopecks: 4000, outletId: lighthouse.result.value.id }],
          periodEndDate: '2026-11-08',
          periodStartDate: '2026-11-02',
        },
      ],
    });
  });

  test('uses daily buckets through 14 days and monthly buckets beyond 90 days', async ({
    clients,
  }) => {
    const daily = await clients.analytics.getProductAnalytics({
      periodEndDate: '2026-01-14',
      periodStartDate: '2026-01-01',
    });
    expect(daily.bucketGranularity).toBe(AnalyticsBucketGranularity.DAY);
    expect(daily.trendBuckets).toHaveLength(14);
    expect(daily.trendBuckets[0]).toMatchObject({
      periodEndDate: '2026-01-01',
      periodStartDate: '2026-01-01',
    });

    const weekly = await clients.analytics.getProductAnalytics({
      periodEndDate: '2026-03-31',
      periodStartDate: '2026-01-01',
    });
    expect(weekly.bucketGranularity).toBe(AnalyticsBucketGranularity.WEEK);

    const monthly = await clients.analytics.getProductAnalytics({
      periodEndDate: '2026-04-01',
      periodStartDate: '2026-01-01',
    });
    expect(monthly.bucketGranularity).toBe(AnalyticsBucketGranularity.MONTH);
    expect(monthly.trendBuckets).toMatchObject([
      { periodEndDate: '2026-01-31', periodStartDate: '2026-01-01' },
      { periodEndDate: '2026-02-28', periodStartDate: '2026-02-01' },
      { periodEndDate: '2026-03-31', periodStartDate: '2026-03-01' },
      { periodEndDate: '2026-04-01', periodStartDate: '2026-04-01' },
    ]);
  });

  test('combines page filters, complete reports, as-of Stock, and the previous period', async ({
    clients,
  }) => {
    const outlet = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    const product = await clients.products.createProduct({ name: 'Кольцо' });
    assertSuccess(outlet);
    assertSuccess(product);

    const previousReport = await clients.reports.createSalesReport({
      outletId: outlet.result.value.id,
      periodEndDate: '2026-10-31',
      periodStartDate: '2026-10-01',
      sales: [
        {
          earningsKopecks: 6000,
          listingName: 'Кольцо ручной работы',
          salesValueKopecks: 7000,
          unitsSold: 2,
        },
      ],
      stockBalances: [
        { listingName: 'Кольцо ручной работы', outletPriceKopecks: 3500, stockBalance: 9 },
      ],
    });
    assertSuccess(previousReport);
    const listing = (await clients.listings.listReportListings({})).listings[0];
    if (listing === undefined) throw new Error('Expected a Report listing');
    await clients.listings.setReportListingProduct({
      productId: product.result.value.id,
      reportListingId: listing.id,
    });

    const currentReport = await clients.reports.createSalesReport({
      outletId: outlet.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-10-15',
      sales: [
        {
          earningsKopecks: 9000,
          listingName: 'Кольцо ручной работы',
          salesValueKopecks: 12000,
          unitsSold: 3,
        },
        {
          earningsKopecks: 5000,
          listingName: 'Без сопоставления',
          salesValueKopecks: 6000,
          unitsSold: 4,
        },
      ],
      stockBalances: [
        { listingName: 'Кольцо ручной работы', outletPriceKopecks: 4000, stockBalance: 5 },
        { listingName: 'Без сопоставления', outletPriceKopecks: 1500, stockBalance: 8 },
      ],
    });
    assertSuccess(currentReport);

    const analytics = await clients.analytics.getProductAnalytics({
      outletIds: [outlet.result.value.id],
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      productIds: [product.result.value.id],
    });
    expect(analytics).toMatchObject({
      outletFinancials: [
        {
          earningsKopecks: 9000,
          outletId: outlet.result.value.id,
          outletShareKopecks: 3000,
        },
      ],
      outlets: [{ id: outlet.result.value.id, name: 'Гончарная лавка' }],
      previousPeriodEndDate: '2026-10-31',
      previousPeriodStartDate: '2026-10-02',
      previousPeriodTotals: {
        currentStockBalance: 9,
        earningsKopecks: 6000,
        outletShareKopecks: 1000,
        unitsSold: 2,
      },
      products: [{ id: product.result.value.id, name: 'Кольцо' }],
      rows: [
        {
          metrics: {
            currentStockBalance: 5,
            earningsKopecks: 9000,
            outletShareKopecks: 3000,
            unitsSold: 3,
          },
          product: { id: product.result.value.id, name: 'Кольцо' },
        },
      ],
      totals: {
        currentStockBalance: 5,
        earningsKopecks: 9000,
        outletShareKopecks: 3000,
        unitsSold: 3,
      },
      unmappedListingCount: 1,
    });
    expect(analytics.trendBuckets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          outletEarnings: [
            expect.objectContaining({
              earningsKopecks: 9000,
              outletId: outlet.result.value.id,
            }),
          ],
          periodEndDate: '2026-11-30',
        }),
      ]),
    );
  });

  test('uses current Product names, archive state, and retroactive mappings with combined filters', async ({
    clients,
  }) => {
    const north = await clients.outlets.createOutlet({ name: 'Север' });
    const south = await clients.outlets.createOutlet({ name: 'Юг' });
    const ring = await clients.products.createProduct({ name: 'Кольцо' });
    const pendant = await clients.products.createProduct({ name: 'Кулон' });
    const retired = await clients.products.createProduct({ name: 'Без истории' });
    assertSuccess(north);
    assertSuccess(south);
    assertSuccess(ring);
    assertSuccess(pendant);
    assertSuccess(retired);
    await clients.products.setProductArchived({ archived: true, id: retired.result.value.id });

    const northReport = await clients.reports.createSalesReport({
      outletId: north.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      sales: [
        { earningsKopecks: 8000, listingName: 'Перстень', salesValueKopecks: 10_000, unitsSold: 4 },
      ],
      stockBalances: [{ listingName: 'Перстень', outletPriceKopecks: 2500, stockBalance: 7 }],
    });
    const southReport = await clients.reports.createSalesReport({
      outletId: south.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      sales: [
        { earningsKopecks: 9000, listingName: 'Подвеска', salesValueKopecks: 12_000, unitsSold: 3 },
      ],
      stockBalances: [{ listingName: 'Подвеска', outletPriceKopecks: 4000, stockBalance: 11 }],
    });
    assertSuccess(northReport);
    assertSuccess(southReport);
    const listings = (await clients.listings.listReportListings({})).listings;
    const ringListing = listings.find(({ name }) => name === 'Перстень');
    const pendantListing = listings.find(({ name }) => name === 'Подвеска');
    if (ringListing === undefined || pendantListing === undefined) {
      throw new Error('Expected both Report listings');
    }
    await clients.listings.setReportListingProduct({
      productId: ring.result.value.id,
      reportListingId: ringListing.id,
    });
    await clients.listings.setReportListingProduct({
      productId: pendant.result.value.id,
      reportListingId: pendantListing.id,
    });
    await clients.products.renameProduct({ id: ring.result.value.id, name: 'Кольцо новое' });
    await clients.products.setProductArchived({ archived: true, id: ring.result.value.id });

    const filtered = await clients.analytics.getProductAnalytics({
      outletIds: [north.result.value.id],
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      productIds: [ring.result.value.id],
    });
    expect(filtered.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          archived: true,
          id: ring.result.value.id,
          name: 'Кольцо новое',
        }),
      ]),
    );
    expect(filtered.products.map(({ id }) => id)).not.toContain(retired.result.value.id);
    expect(filtered).toMatchObject({
      rows: [
        {
          metrics: { currentStockBalance: 7, earningsKopecks: 8000, unitsSold: 4 },
          product: { archived: true, id: ring.result.value.id, name: 'Кольцо новое' },
        },
      ],
      totals: { currentStockBalance: 7, earningsKopecks: 8000, unitsSold: 4 },
    });

    await clients.listings.setReportListingProduct({
      productId: pendant.result.value.id,
      reportListingId: ringListing.id,
    });
    await expect(
      clients.analytics.getProductAnalytics({
        outletIds: [north.result.value.id],
        periodEndDate: '2026-11-30',
        periodStartDate: '2026-11-01',
        productIds: [ring.result.value.id],
      }),
    ).resolves.toMatchObject({ rows: [], totals: { currentStockBalance: 0, unitsSold: 0 } });
    await expect(
      clients.analytics.getProductAnalytics({
        outletIds: [north.result.value.id],
        periodEndDate: '2026-11-30',
        periodStartDate: '2026-11-01',
        productIds: [pendant.result.value.id],
      }),
    ).resolves.toMatchObject({
      rows: [{ metrics: { currentStockBalance: 7, earningsKopecks: 8000, unitsSold: 4 } }],
      totals: { currentStockBalance: 7, earningsKopecks: 8000, unitsSold: 4 },
    });
  });

  test('uses the latest saved active report for same-day Stock and reacts to correction, archive, and restore', async ({
    clients,
  }) => {
    const outlet = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    const product = await clients.products.createProduct({ name: 'Кольцо' });
    assertSuccess(outlet);
    assertSuccess(product);
    const createReport = (stockBalance: number) =>
      clients.reports.createSalesReport({
        outletId: outlet.result.value.id,
        periodEndDate: '2026-11-30',
        periodStartDate: '2026-11-01',
        stockBalances: [{ listingName: 'Кольцо', outletPriceKopecks: 3500, stockBalance }],
      });
    const earlier = await createReport(3);
    const later = await createReport(8);
    assertSuccess(earlier);
    assertSuccess(later);
    const listing = (await clients.listings.listReportListings({})).listings[0];
    if (listing === undefined) throw new Error('Expected a Report listing');
    await clients.listings.setReportListingProduct({
      productId: product.result.value.id,
      reportListingId: listing.id,
    });
    const request = {
      outletIds: [outlet.result.value.id],
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      productIds: [product.result.value.id],
    };

    await expect(clients.analytics.getProductAnalytics(request)).resolves.toMatchObject({
      totals: { currentStockBalance: 8 },
    });
    await clients.reports.updateSalesReport({
      id: later.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      stockBalances: [{ listingName: 'Кольцо', outletPriceKopecks: 3500, stockBalance: 13 }],
    });
    await expect(clients.analytics.getProductAnalytics(request)).resolves.toMatchObject({
      totals: { currentStockBalance: 13 },
    });
    await clients.reports.setSalesReportArchived({ archived: true, id: later.result.value.id });
    await expect(clients.analytics.getProductAnalytics(request)).resolves.toMatchObject({
      totals: { currentStockBalance: 3 },
    });
    await clients.reports.setSalesReportArchived({ archived: false, id: later.result.value.id });
    await expect(clients.analytics.getProductAnalytics(request)).resolves.toMatchObject({
      totals: { currentStockBalance: 13 },
    });
  });

  test('answers a ten-year monthly workload within two seconds', async ({ clients, database }) => {
    const outletCount = 5;
    const productCount = 10;
    const reportsPerOutlet = 120;
    const nowMs = new Date('2026-11-08T09:00:00.000Z').getTime();
    const outlets = Array.from({ length: outletCount }, (_, index) => ({
      archived_at_ms: null,
      created_at_ms: nowMs + index,
      id: `outlet-${index}`,
      name: `Магазин ${index}`,
    }));
    const products = Array.from({ length: productCount }, (_, index) => ({
      archived_at_ms: null,
      created_at_ms: nowMs + index,
      id: `product-${index}`,
      name: `Штучка ${index}`,
    }));
    const listings = products.map((product, index) => ({
      created_at_ms: nowMs + index,
      id: `listing-${index}`,
      name: `Позиция ${index}`,
      product_id: product.id,
    }));
    const reports = outlets.flatMap((outlet) =>
      Array.from({ length: reportsPerOutlet }, (_, monthIndex) => {
        const year = 2017 + Math.floor(monthIndex / 12);
        const month = (monthIndex % 12) + 1;
        const period = `${year}-${month.toString().padStart(2, '0')}`;
        return {
          archived_at_ms: null,
          created_at_ms: nowMs + monthIndex,
          id: `${outlet.id}-report-${monthIndex}`,
          outlet_id: outlet.id,
          period_end_date: `${period}-28`,
          period_start_date: `${period}-01`,
          updated_at_ms: nowMs + monthIndex,
        };
      }),
    );
    const sales = reports.flatMap((report) =>
      listings.map((listing) => ({
        earnings_kopecks: 1000,
        outlet_share_kopecks: 200,
        report_id: report.id,
        report_listing_id: listing.id,
        units_sold: 1,
      })),
    );
    const stock = reports.flatMap((report) =>
      listings.map((listing) => ({
        outlet_price_kopecks: 1200,
        report_id: report.id,
        report_listing_id: listing.id,
        stock_balance: 2,
      })),
    );
    await database.value.db.transaction().execute(async (transaction) => {
      await transaction.insertInto('outlets').values(outlets).execute();
      await transaction.insertInto('products').values(products).execute();
      await transaction.insertInto('report_listings').values(listings).execute();
      await transaction.insertInto('sales_reports').values(reports).execute();
      await transaction.insertInto('sales_report_sales').values(sales).execute();
      await transaction.insertInto('sales_report_stock_balances').values(stock).execute();
    });

    const startedAt = performance.now();
    const result = await clients.analytics.getProductAnalytics({
      periodEndDate: '2026-12-31',
      periodStartDate: '2017-01-01',
    });
    const elapsedMs = performance.now() - startedAt;

    expect(result.rows).toHaveLength(productCount);
    expect(result.trendBuckets).toHaveLength(reportsPerOutlet);
    expect(result.totals?.unitsSold).toBe(outletCount * productCount * reportsPerOutlet);
    expect(elapsedMs).toBeLessThan(2000);
  });
});
