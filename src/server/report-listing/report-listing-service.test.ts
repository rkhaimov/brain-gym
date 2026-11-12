import { createClient, createRouterTransport } from '@connectrpc/connect';
import { describe, expect } from 'vitest';

import { OutletService } from '../../shared/gen/ceramics/v1/outlet_pb.js';
import { ReportListingService } from '../../shared/gen/ceramics/v1/report_listing_pb.js';
import { SalesReportService } from '../../shared/gen/ceramics/v1/sales_report_pb.js';
import { assertSuccess } from '../../test/server/assertions.js';
import { testEnv } from '../../test/server/env.js';
import { test as serverTest } from '../../test/server/test.js';
import { MutationQueue } from '../mutation-queue.js';
import { registerOutletRoutes } from '../outlet/outlet-service.js';
import { registerSalesReportRoutes } from '../sales-report/sales-report-service.js';
import { registerReportListingRoutes } from './report-listing-service.js';

const test = serverTest.extend<{
  readonly clients: {
    readonly listings: ReturnType<typeof createClient<typeof ReportListingService>>;
    readonly outlets: ReturnType<typeof createClient<typeof OutletService>>;
    readonly reports: ReturnType<typeof createClient<typeof SalesReportService>>;
  };
}>({
  clients: async ({ database }, use) => {
    const mutationQueue = new MutationQueue();
    const dependencies = { database: database.value, env: testEnv, mutationQueue };
    const transport = createRouterTransport((router) => {
      registerOutletRoutes(router, dependencies);
      registerReportListingRoutes(router, { database: database.value });
      registerSalesReportRoutes(router, dependencies);
    });
    await use({
      listings: createClient(ReportListingService, transport),
      outlets: createClient(OutletService, transport),
      reports: createClient(SalesReportService, transport),
    });
  },
});

describe('ReportListingService', () => {
  test('shares exact Report listings across Outlets while isolating Outlet metrics', async ({
    clients,
    database,
  }) => {
    const firstOutlet = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    const secondOutlet = await clients.outlets.createOutlet({ name: 'Керамический дворик' });
    assertSuccess(firstOutlet);
    assertSuccess(secondOutlet);

    const firstReport = await clients.reports.createSalesReport({
      outletId: firstOutlet.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      sales: [
        {
          earningsKopecks: 6000,
          listingName: ' Кольцо ',
          salesValueKopecks: 7000,
          unitsSold: 2,
        },
      ],
      stockBalances: [{ listingName: ' Кольцо ', outletPriceKopecks: 3500, stockBalance: 5 }],
    });
    const latestReport = await clients.reports.createSalesReport({
      outletId: firstOutlet.result.value.id,
      periodEndDate: '2026-12-31',
      periodStartDate: '2026-12-01',
      sales: [
        {
          earningsKopecks: 8000,
          listingName: 'Кольцо',
          salesValueKopecks: 9900,
          unitsSold: 4,
        },
      ],
      stockBalances: [{ listingName: 'Серьги', outletPriceKopecks: 4200, stockBalance: 2 }],
    });
    const otherOutletReport = await clients.reports.createSalesReport({
      outletId: secondOutlet.result.value.id,
      periodEndDate: '2026-12-31',
      periodStartDate: '2026-12-01',
      stockBalances: [{ listingName: 'Кольцо', outletPriceKopecks: 9900, stockBalance: 9 }],
    });
    assertSuccess(firstReport);
    assertSuccess(latestReport);
    assertSuccess(otherOutletReport);

    await expect(
      clients.listings.listReportListings({ outletId: firstOutlet.result.value.id }),
    ).resolves.toMatchObject({
      listings: [
        {
          currentStockBalance: 0,
          lastOutletPriceKopecks: 3500,
          latestUnitsSold: 4,
          name: 'Кольцо',
        },
        {
          currentStockBalance: 2,
          lastOutletPriceKopecks: 4200,
          latestUnitsSold: 0,
          name: 'Серьги',
        },
      ],
    });
    await expect(
      clients.listings.listReportListings({ outletId: secondOutlet.result.value.id }),
    ).resolves.toMatchObject({
      listings: [
        {
          currentStockBalance: 9,
          lastOutletPriceKopecks: 9900,
          name: 'Кольцо',
        },
      ],
    });

    await expect(
      database.value.db.selectFrom('report_listings').selectAll().execute(),
    ).resolves.toHaveLength(2);
    const sharedListingReferences = await database.value.db
      .selectFrom('sales_report_stock_balances')
      .innerJoin('report_listings', 'report_listings.id', 'report_listing_id')
      .select(['report_listing_id', 'report_listings.name'])
      .where('report_listings.name', '=', 'Кольцо')
      .execute();
    expect([...new Set(sharedListingReferences.map((row) => row.report_listing_id))]).toHaveLength(
      1,
    );
  });

  test('keeps exact names distinct after trimming', async ({ clients, database }) => {
    const outlet = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(outlet);

    const report = await clients.reports.createSalesReport({
      outletId: outlet.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      stockBalances: [
        { listingName: ' Кольцо ', outletPriceKopecks: 3500, stockBalance: 1 },
        { listingName: 'кольцо', outletPriceKopecks: 3600, stockBalance: 2 },
        { listingName: 'Кольцо!', outletPriceKopecks: 3700, stockBalance: 3 },
      ],
    });
    assertSuccess(report);

    await expect(
      database.value.db.selectFrom('report_listings').select('name').orderBy('name').execute(),
    ).resolves.toEqual([{ name: 'Кольцо' }, { name: 'Кольцо!' }, { name: 'кольцо' }]);
  });

  test('derives Outlet membership from active and archived report rows', async ({
    clients,
    database,
  }) => {
    const outlet = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(outlet);
    const report = await clients.reports.createSalesReport({
      outletId: outlet.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      stockBalances: [{ listingName: 'Яшма', outletPriceKopecks: 3500, stockBalance: 5 }],
    });
    assertSuccess(report);

    await clients.reports.setSalesReportArchived({ archived: true, id: report.result.value.id });
    await expect(
      clients.listings.listReportListings({ outletId: outlet.result.value.id }),
    ).resolves.toMatchObject({
      listings: [{ currentStockBalance: 0, lastOutletPriceKopecks: 0, name: 'Яшма' }],
    });

    await clients.reports.setSalesReportArchived({ archived: false, id: report.result.value.id });
    const edited = await clients.reports.updateSalesReport({
      id: report.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
    });
    assertSuccess(edited);
    await expect(
      clients.listings.listReportListings({ outletId: outlet.result.value.id }),
    ).resolves.toMatchObject({ listings: [] });
    await expect(
      database.value.db.selectFrom('report_listings').selectAll().execute(),
    ).resolves.toHaveLength(1);
  });

  test('derives current Stock from period end and collision-safe saved ordering', async ({
    clients,
  }) => {
    testEnv.now.mockReturnValue(new Date('2026-11-11T10:00:00.000Z'));
    const outlet = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(outlet);

    const laterPeriod = await clients.reports.createSalesReport({
      outletId: outlet.result.value.id,
      periodEndDate: '2026-12-31',
      periodStartDate: '2026-12-01',
      sales: [
        { earningsKopecks: 3000, listingName: 'Яшма', salesValueKopecks: 3500, unitsSold: 1 },
      ],
      stockBalances: [{ listingName: 'Яшма', outletPriceKopecks: 3500, stockBalance: 5 }],
    });
    const olderPeriodSavedLater = await clients.reports.createSalesReport({
      outletId: outlet.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      stockBalances: [{ listingName: 'Яшма', outletPriceKopecks: 3400, stockBalance: 9 }],
    });
    assertSuccess(laterPeriod);
    assertSuccess(olderPeriodSavedLater);

    await expect(
      clients.listings.listReportListings({ outletId: outlet.result.value.id }),
    ).resolves.toMatchObject({
      listings: [{ currentStockBalance: 5, latestUnitsSold: 1, name: 'Яшма' }],
    });

    const equalDateSavedLater = await clients.reports.createSalesReport({
      outletId: outlet.result.value.id,
      periodEndDate: '2026-12-31',
      periodStartDate: '2026-12-01',
      stockBalances: [{ listingName: 'Агат', outletPriceKopecks: 4200, stockBalance: 7 }],
    });
    assertSuccess(equalDateSavedLater);
    expect(equalDateSavedLater.result.value.updatedAtMs).toBeGreaterThan(
      laterPeriod.result.value.updatedAtMs,
    );
    await expect(
      clients.listings.listReportListings({ outletId: outlet.result.value.id }),
    ).resolves.toMatchObject({
      listings: [
        { currentStockBalance: 0, latestUnitsSold: 0, name: 'Яшма' },
        { currentStockBalance: 7, latestUnitsSold: 0, name: 'Агат' },
      ],
    });

    const edited = await clients.reports.updateSalesReport({
      id: laterPeriod.result.value.id,
      periodEndDate: '2026-12-31',
      periodStartDate: '2026-12-01',
      stockBalances: [{ listingName: 'Яшма', outletPriceKopecks: 3600, stockBalance: 3 }],
    });
    assertSuccess(edited);
    await expect(
      clients.listings.listReportListings({ outletId: outlet.result.value.id }),
    ).resolves.toMatchObject({
      listings: [
        { currentStockBalance: 3, latestUnitsSold: 0, name: 'Яшма' },
        { currentStockBalance: 0, latestUnitsSold: 0, name: 'Агат' },
      ],
    });

    await clients.reports.setSalesReportArchived({
      archived: true,
      id: laterPeriod.result.value.id,
    });
    await expect(
      clients.listings.listReportListings({ outletId: outlet.result.value.id }),
    ).resolves.toMatchObject({
      listings: [
        { currentStockBalance: 0, name: 'Яшма' },
        { currentStockBalance: 7, name: 'Агат' },
      ],
    });
    await clients.reports.setSalesReportArchived({
      archived: false,
      id: laterPeriod.result.value.id,
    });
    await expect(
      clients.listings.listReportListings({ outletId: outlet.result.value.id }),
    ).resolves.toMatchObject({
      listings: [
        { currentStockBalance: 3, name: 'Яшма' },
        { currentStockBalance: 0, name: 'Агат' },
      ],
    });
  });
});
