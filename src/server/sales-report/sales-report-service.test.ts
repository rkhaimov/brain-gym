import { createClient, createRouterTransport } from '@connectrpc/connect';
import { sql } from 'kysely';
import { describe, expect } from 'vitest';

import { OutletService } from '../../shared/gen/ceramics/v1/outlet_pb.js';
import {
  SalesReportMutationFailureField,
  SalesReportSection,
  SalesReportService,
} from '../../shared/gen/ceramics/v1/sales_report_pb.js';
import { assertSuccess } from '../../test/server/assertions.js';
import { testEnv } from '../../test/server/env.js';
import { test as serverTest } from '../../test/server/test.js';
import { MutationQueue } from '../mutation-queue.js';
import { registerOutletRoutes } from '../outlet/outlet-service.js';
import { registerSalesReportRoutes } from './sales-report-service.js';

const test = serverTest.extend<{
  readonly clients: {
    readonly outlets: ReturnType<typeof createClient<typeof OutletService>>;
    readonly reports: ReturnType<typeof createClient<typeof SalesReportService>>;
  };
}>({
  clients: async ({ database }, use) => {
    const mutationQueue = new MutationQueue();
    const transport = createRouterTransport((router) => {
      const dependencies = { database: database.value, env: testEnv, mutationQueue };
      registerOutletRoutes(router, dependencies);
      registerSalesReportRoutes(router, dependencies);
    });
    await use({
      outlets: createClient(OutletService, transport),
      reports: createClient(SalesReportService, transport),
    });
  },
});

describe('SalesReportService', () => {
  test('creator can save and retrieve an empty report for an active Outlet', async ({
    clients,
  }) => {
    const outletResponse = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(outletResponse);

    const created = await clients.reports.createSalesReport({
      outletId: outletResponse.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
    });

    assertSuccess(created);
    expect(created.result.value).toMatchObject({
      outletId: outletResponse.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      sales: [],
      stockBalances: [],
    });
    await expect(
      clients.reports.getSalesReport({ id: created.result.value.id }),
    ).resolves.toMatchObject({
      result: {
        case: 'success',
        value: {
          id: created.result.value.id,
          outletId: outletResponse.result.value.id,
          sales: [],
          stockBalances: [],
        },
      },
    });
  });

  test('creator can save exact Sales and Stock memberships with derived Outlet shares', async ({
    clients,
  }) => {
    const outletResponse = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(outletResponse);

    const created = await clients.reports.createSalesReport({
      outletId: outletResponse.result.value.id,
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
          listingName: ' Серьги! ',
          salesValueKopecks: 3000,
          unitsSold: 1,
        },
      ],
      stockBalances: [
        { listingName: 'Кольцо', outletPriceKopecks: 3500, stockBalance: 5 },
        { listingName: 'Кулон', outletPriceKopecks: 4000, stockBalance: 3 },
      ],
    });

    assertSuccess(created);
    expect(created.result.value.sales).toHaveLength(2);
    expect(created.result.value.sales).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          earningsKopecks: 6000,
          listingName: 'Кольцо',
          outletShareKopecks: 1000,
          unitsSold: 2,
        }),
        expect.objectContaining({
          earningsKopecks: 2000,
          listingName: 'Серьги!',
          outletShareKopecks: 1000,
          unitsSold: 1,
        }),
      ]),
    );
    expect(created.result.value.stockBalances).toHaveLength(2);
    expect(created.result.value.stockBalances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ listingName: 'Кольцо', stockBalance: 5 }),
        expect.objectContaining({ listingName: 'Кулон', stockBalance: 3 }),
      ]),
    );

    const persisted = await clients.reports.getSalesReport({ id: created.result.value.id });
    assertSuccess(persisted);
    expect(persisted.result.value).toEqual(created.result.value);
  });

  test('creator can list an Outlet report history', async ({ clients }) => {
    const outlet = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(outlet);
    const created = await clients.reports.createSalesReport({
      outletId: outlet.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      sales: [
        { earningsKopecks: 1, listingName: 'Кольцо', salesValueKopecks: 2, unitsSold: 1 },
        { earningsKopecks: 1, listingName: 'Серьги', salesValueKopecks: 1, unitsSold: 1 },
      ],
      stockBalances: [
        { listingName: 'Кольцо', outletPriceKopecks: 1, stockBalance: 2 },
        { listingName: 'Кулон', outletPriceKopecks: 1, stockBalance: 2 },
      ],
    });
    assertSuccess(created);
    await expect(
      clients.reports.listSalesReports({ outletId: outlet.result.value.id }),
    ).resolves.toMatchObject({
      reports: [
        {
          id: created.result.value.id,
          listingCount: 3,
          periodEndDate: '2026-11-30',
          periodStartDate: '2026-11-01',
        },
      ],
    });
  });

  test('stores section rows through immutable Outlet listing IDs without Sales value or Sales unit price', async ({
    clients,
    database,
  }) => {
    const outlet = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(outlet);
    const report = await clients.reports.createSalesReport({
      outletId: outlet.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      sales: [
        {
          earningsKopecks: 2000,
          listingName: 'Продажа без остатка',
          salesValueKopecks: 3000,
          unitsSold: 1,
        },
      ],
      stockBalances: [
        { listingName: 'Остаток без продаж', outletPriceKopecks: 4000, stockBalance: 3 },
      ],
    });
    assertSuccess(report);

    const sales = await database.value.db
      .selectFrom('sales_report_sales')
      .innerJoin('outlet_listings', 'outlet_listings.id', 'outlet_listing_id')
      .select([
        'earnings_kopecks',
        'outlet_listings.name',
        'outlet_listing_id',
        'outlet_share_kopecks',
        'units_sold',
      ])
      .where('report_id', '=', report.result.value.id)
      .execute();
    expect(sales.map(({ outlet_listing_id: _outletListingId, ...sale }) => sale)).toEqual([
      {
        earnings_kopecks: 2000,
        name: 'Продажа без остатка',
        outlet_share_kopecks: 1000,
        units_sold: 1,
      },
    ]);
    const stockBalances = await database.value.db
      .selectFrom('sales_report_stock_balances')
      .innerJoin('outlet_listings', 'outlet_listings.id', 'outlet_listing_id')
      .select([
        'outlet_listings.name',
        'outlet_listing_id',
        'outlet_price_kopecks',
        'stock_balance',
      ])
      .where('report_id', '=', report.result.value.id)
      .execute();
    expect(stockBalances.map(({ outlet_listing_id: _outletListingId, ...stock }) => stock)).toEqual(
      [
        {
          name: 'Остаток без продаж',
          outlet_price_kopecks: 4000,
          stock_balance: 3,
        },
      ],
    );
    expect([...sales, ...stockBalances].every((row) => row.outlet_listing_id.length > 0)).toBe(
      true,
    );

    const columns = await sql<{ name: string }>`pragma table_info('sales_report_sales')`.execute(
      database.value.db,
    );
    expect(columns.rows.map((column) => column.name)).toEqual([
      'report_id',
      'outlet_listing_id',
      'units_sold',
      'earnings_kopecks',
      'outlet_share_kopecks',
    ]);
  });

  test('creator receives precise Outlet and Reporting period failures', async ({ clients }) => {
    const outletResponse = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(outletResponse);
    const outletId = outletResponse.result.value.id;
    const cases = [
      {
        expected: {
          field: SalesReportMutationFailureField.OUTLET,
          message: 'Выберите действующую полку',
        },
        request: {
          outletId: 'missing',
          periodEndDate: '2026-11-30',
          periodStartDate: '2026-11-01',
        },
      },
      {
        expected: {
          field: SalesReportMutationFailureField.PERIOD_START,
          message: 'Введите дату начала отчётного периода',
        },
        request: { outletId, periodEndDate: '2026-11-30', periodStartDate: '' },
      },
      {
        expected: {
          field: SalesReportMutationFailureField.PERIOD_END,
          message: 'Введите дату окончания отчётного периода',
        },
        request: { outletId, periodEndDate: 'not-a-date', periodStartDate: '2026-11-01' },
      },
      {
        expected: {
          field: SalesReportMutationFailureField.PERIOD_END,
          message: 'Дата окончания не может быть раньше даты начала',
        },
        request: { outletId, periodEndDate: '2026-10-31', periodStartDate: '2026-11-01' },
      },
    ];

    for (const scenario of cases) {
      await expect(clients.reports.createSalesReport(scenario.request)).resolves.toMatchObject({
        result: { case: 'failure', value: scenario.expected },
      });
    }

    await clients.outlets.setOutletArchived({ archived: true, id: outletId });
    await expect(
      clients.reports.createSalesReport({
        outletId,
        periodEndDate: '2026-11-30',
        periodStartDate: '2026-11-01',
      }),
    ).resolves.toMatchObject({
      result: {
        case: 'failure',
        value: { field: SalesReportMutationFailureField.OUTLET },
      },
    });
  });

  test('creator receives exact listing failures for each report section', async ({ clients }) => {
    const outletResponse = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(outletResponse);
    const base = {
      outletId: outletResponse.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
    };
    const cases = [
      {
        expected: {
          field: SalesReportMutationFailureField.LISTING_NAME,
          message: 'Введите название позиции',
          rowIndex: 0,
          section: SalesReportSection.SALES,
        },
        request: { ...base, sales: [{ earningsKopecks: 0, listingName: '', unitsSold: 0 }] },
      },
      {
        expected: {
          field: SalesReportMutationFailureField.LISTING_NAME,
          message: 'Введите название позиции',
          rowIndex: 0,
          section: SalesReportSection.STOCK_BALANCE,
        },
        request: {
          ...base,
          stockBalances: [{ listingName: '', outletPriceKopecks: 0, stockBalance: 0 }],
        },
      },
      {
        expected: {
          field: SalesReportMutationFailureField.LISTING_NAME,
          message: 'Позиция с таким названием уже добавлена в этот раздел',
          rowIndex: 1,
          section: SalesReportSection.SALES,
        },
        request: {
          ...base,
          sales: [
            { earningsKopecks: 0, listingName: 'Кольцо', salesValueKopecks: 0, unitsSold: 0 },
            { earningsKopecks: 0, listingName: 'Кольцо', salesValueKopecks: 0, unitsSold: 0 },
          ],
        },
      },
      {
        expected: {
          field: SalesReportMutationFailureField.LISTING_NAME,
          rowIndex: 1,
          section: SalesReportSection.STOCK_BALANCE,
        },
        request: {
          ...base,
          stockBalances: [
            { listingName: 'Кольцо', outletPriceKopecks: 1, stockBalance: 0 },
            { listingName: 'Кольцо', outletPriceKopecks: 1, stockBalance: 0 },
          ],
        },
      },
    ];

    for (const scenario of cases) {
      await expect(clients.reports.createSalesReport(scenario.request)).resolves.toMatchObject({
        result: { case: 'failure', value: scenario.expected },
      });
    }
  });

  test('creator receives whole non-negative safe-number failures', async ({ clients }) => {
    const outletResponse = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(outletResponse);
    const base = {
      outletId: outletResponse.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
    };
    const invalidNumbers = [-1, 0.5, Number.MAX_SAFE_INTEGER + 1];

    for (const value of invalidNumbers) {
      await expect(
        clients.reports.createSalesReport({
          ...base,
          sales: [
            { earningsKopecks: 0, listingName: 'Кольцо', salesValueKopecks: 1, unitsSold: value },
          ],
        }),
      ).resolves.toMatchObject({
        result: {
          case: 'failure',
          value: {
            field: SalesReportMutationFailureField.UNITS_SOLD,
            rowIndex: 0,
            section: SalesReportSection.SALES,
          },
        },
      });
      await expect(
        clients.reports.createSalesReport({
          ...base,
          stockBalances: [{ listingName: 'Кольцо', outletPriceKopecks: 1, stockBalance: value }],
        }),
      ).resolves.toMatchObject({
        result: {
          case: 'failure',
          value: {
            field: SalesReportMutationFailureField.STOCK_BALANCE,
            rowIndex: 0,
            section: SalesReportSection.STOCK_BALANCE,
          },
        },
      });
      await expect(
        clients.reports.createSalesReport({
          ...base,
          sales: [
            { earningsKopecks: value, listingName: 'Кольцо', salesValueKopecks: 1, unitsSold: 1 },
          ],
        }),
      ).resolves.toMatchObject({
        result: {
          case: 'failure',
          value: { field: SalesReportMutationFailureField.EARNINGS },
        },
      });
      await expect(
        clients.reports.createSalesReport({
          ...base,
          sales: [
            { earningsKopecks: 0, listingName: 'Кольцо', salesValueKopecks: value, unitsSold: 0 },
          ],
        }),
      ).resolves.toMatchObject({
        result: {
          case: 'failure',
          value: { field: SalesReportMutationFailureField.SALES_VALUE },
        },
      });
      await expect(
        clients.reports.createSalesReport({
          ...base,
          stockBalances: [{ listingName: 'Кольцо', outletPriceKopecks: value, stockBalance: 0 }],
        }),
      ).resolves.toMatchObject({
        result: {
          case: 'failure',
          value: { field: SalesReportMutationFailureField.OUTLET_PRICE },
        },
      });
    }

    await expect(
      clients.reports.createSalesReport({
        ...base,
        sales: [{ earningsKopecks: 2, listingName: 'Кольцо', salesValueKopecks: 1, unitsSold: 1 }],
      }),
    ).resolves.toMatchObject({
      result: {
        case: 'failure',
        value: {
          field: SalesReportMutationFailureField.EARNINGS,
          message: 'Заработано не может превышать сумму продаж',
        },
      },
    });
  });

  test('creator can save repeated and overlapping Reporting periods', async ({ clients }) => {
    const outletResponse = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(outletResponse);
    const request = {
      outletId: outletResponse.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
    };

    const first = await clients.reports.createSalesReport(request);
    const repeated = await clients.reports.createSalesReport(request);
    const overlapping = await clients.reports.createSalesReport({
      ...request,
      periodEndDate: '2026-12-15',
      periodStartDate: '2026-11-15',
    });

    assertSuccess(first);
    assertSuccess(repeated);
    assertSuccess(overlapping);
    expect(
      new Set([first.result.value.id, repeated.result.value.id, overlapping.result.value.id]).size,
    ).toBe(3);
  });

  test('listing names are trimmed, remain case-sensitive, and may appear once per section', async ({
    clients,
  }) => {
    const outletResponse = await clients.outlets.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(outletResponse);

    const duplicate = await clients.reports.createSalesReport({
      outletId: outletResponse.result.value.id,
      periodEndDate: '2026-11-30',
      periodStartDate: '2026-11-01',
      sales: [
        { earningsKopecks: 0, listingName: 'Кольцо', salesValueKopecks: 1, unitsSold: 0 },
        { earningsKopecks: 0, listingName: ' Кольцо ', salesValueKopecks: 1, unitsSold: 0 },
      ],
    });
    expect(duplicate.result).toMatchObject({
      case: 'failure',
      value: { field: SalesReportMutationFailureField.LISTING_NAME, rowIndex: 1 },
    });

    const response = await clients.reports.createSalesReport({
      outletId: outletResponse.result.value.id,
      periodEndDate: '2026-12-31',
      periodStartDate: '2026-12-01',
      sales: [
        { earningsKopecks: 0, listingName: ' Кольцо ', salesValueKopecks: 0, unitsSold: 0 },
        { earningsKopecks: 0, listingName: 'кольцо', salesValueKopecks: 1, unitsSold: 0 },
      ],
      stockBalances: [{ listingName: 'Кольцо', outletPriceKopecks: 1, stockBalance: 0 }],
    });

    assertSuccess(response);
    expect(response.result.value.sales.map((sale) => sale.listingName)).toEqual([
      'Кольцо',
      'кольцо',
    ]);
  });
});
