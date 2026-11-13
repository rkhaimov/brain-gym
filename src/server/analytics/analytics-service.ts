import { create } from '@bufbuild/protobuf';
import { Code, ConnectError, type ConnectRouter, type ServiceImpl } from '@connectrpc/connect';

import {
  AnalyticsMetricsSchema,
  AnalyticsOutletOptionSchema,
  AnalyticsProductOptionSchema,
  AnalyticsService,
  ProductAnalyticsRowSchema,
} from '../../shared/gen/ceramics/v1/analytics_pb.js';
import type { AnalyticsMetrics } from '../../shared/gen/ceramics/v1/analytics_pb.js';
import type { ApplicationDatabase } from '../database/database.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface AnalyticsRouteDependencies {
  readonly database: ApplicationDatabase;
}

interface Metrics {
  currentStockBalance: number;
  earningsKopecks: number;
  outletShareKopecks: number;
  unitsSold: number;
}

function emptyMetrics(): Metrics {
  return {
    currentStockBalance: 0,
    earningsKopecks: 0,
    outletShareKopecks: 0,
    unitsSold: 0,
  };
}

function metricsToProtobuf(metrics: Metrics): AnalyticsMetrics {
  return create(AnalyticsMetricsSchema, metrics);
}

function parseCalendarDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new ConnectError(`Invalid analytics calendar date: ${value}`, Code.InvalidArgument);
  }
  return date;
}

function formatCalendarDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function previousPeriod(periodStartDate: string, periodEndDate: string) {
  const start = parseCalendarDate(periodStartDate);
  const end = parseCalendarDate(periodEndDate);
  const durationDays = Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1;
  if (durationDays <= 0) {
    throw new ConnectError('Analytics period end precedes its start', Code.InvalidArgument);
  }
  const previousEnd = new Date(start.getTime() - DAY_MS);
  const previousStart = new Date(previousEnd.getTime() - (durationDays - 1) * DAY_MS);
  return {
    end: formatCalendarDate(previousEnd),
    start: formatCalendarDate(previousStart),
  };
}

function reportPrecedes(
  left: Readonly<{ id: string; period_end_date: string; updated_at_ms: number }>,
  right: Readonly<{ id: string; period_end_date: string; updated_at_ms: number }>,
): boolean {
  return (
    left.period_end_date > right.period_end_date ||
    (left.period_end_date === right.period_end_date &&
      (left.updated_at_ms > right.updated_at_ms ||
        (left.updated_at_ms === right.updated_at_ms && left.id > right.id)))
  );
}

function latestReportIds(
  reports: readonly Readonly<{
    id: string;
    outlet_id: string;
    period_end_date: string;
    updated_at_ms: number;
  }>[],
  endDate: string,
): Set<string> {
  const latestByOutlet = new Map<
    string,
    Readonly<{ id: string; period_end_date: string; updated_at_ms: number }>
  >();
  for (const report of reports) {
    if (report.period_end_date > endDate) continue;
    const latest = latestByOutlet.get(report.outlet_id);
    if (latest === undefined || reportPrecedes(report, latest)) {
      latestByOutlet.set(report.outlet_id, report);
    }
  }
  return new Set([...latestByOutlet.values()].map(({ id }) => id));
}

function addMetrics(target: Metrics, source: Partial<Metrics>): void {
  target.currentStockBalance += source.currentStockBalance ?? 0;
  target.earningsKopecks += source.earningsKopecks ?? 0;
  target.outletShareKopecks += source.outletShareKopecks ?? 0;
  target.unitsSold += source.unitsSold ?? 0;
}

function createAnalyticsService(
  dependencies: AnalyticsRouteDependencies,
): ServiceImpl<typeof AnalyticsService> {
  const { database } = dependencies;

  return {
    async getProductAnalytics(request) {
      const previous = previousPeriod(request.periodStartDate, request.periodEndDate);
      const [outletRows, productRows, mappedProductRows] = await Promise.all([
        database.db
          .selectFrom('outlets')
          .select(['archived_at_ms', 'created_at_ms', 'id', 'name'])
          .where('archived_at_ms', 'is', null)
          .orderBy('created_at_ms')
          .orderBy('name')
          .execute(),
        database.db
          .selectFrom('products')
          .select(['archived_at_ms', 'created_at_ms', 'id', 'name'])
          .orderBy('created_at_ms')
          .orderBy('name')
          .execute(),
        database.db
          .selectFrom('report_listings')
          .select('product_id')
          .distinct()
          .where('product_id', 'is not', null)
          .execute(),
      ]);
      const mappedProductIds = new Set(mappedProductRows.map(({ product_id }) => product_id));
      const optionProductRows = productRows.filter(
        (product) => product.archived_at_ms === null || mappedProductIds.has(product.id),
      );
      const availableOutletIds = new Set(outletRows.map(({ id }) => id));
      const selectedOutletIds = new Set(
        request.outletIds.length === 0
          ? availableOutletIds
          : request.outletIds.filter((id) => availableOutletIds.has(id)),
      );
      const selectedProductIds =
        request.productIds.length === 0 ? undefined : new Set(request.productIds);
      if (selectedOutletIds.size === 0) {
        return {
          outlets: outletRows.map((outlet) => create(AnalyticsOutletOptionSchema, outlet)),
          previousPeriodEndDate: previous.end,
          previousPeriodStartDate: previous.start,
          previousPeriodTotals: metricsToProtobuf(emptyMetrics()),
          products: optionProductRows.map((product) =>
            create(AnalyticsProductOptionSchema, {
              archived: product.archived_at_ms !== null,
              id: product.id,
              name: product.name,
            }),
          ),
          rows: [],
          totals: metricsToProtobuf(emptyMetrics()),
          unmappedListingCount: 0,
        };
      }

      const reports = await database.db
        .selectFrom('sales_reports')
        .select(['id', 'outlet_id', 'period_end_date', 'updated_at_ms'])
        .where('archived_at_ms', 'is', null)
        .where('outlet_id', 'in', [...selectedOutletIds])
        .where('period_end_date', '<=', request.periodEndDate)
        .execute();
      const currentSalesReportIds = new Set(
        reports
          .filter(
            ({ period_end_date }) =>
              period_end_date >= request.periodStartDate &&
              period_end_date <= request.periodEndDate,
          )
          .map(({ id }) => id),
      );
      const previousSalesReportIds = new Set(
        reports
          .filter(
            ({ period_end_date }) =>
              period_end_date >= previous.start && period_end_date <= previous.end,
          )
          .map(({ id }) => id),
      );
      const currentStockReportIds = latestReportIds(reports, request.periodEndDate);
      const previousStockReportIds = latestReportIds(reports, previous.end);
      const salesReportIds = [...new Set([...currentSalesReportIds, ...previousSalesReportIds])];
      const stockReportIds = [...new Set([...currentStockReportIds, ...previousStockReportIds])];

      const [sales, stockBalances] = await Promise.all([
        salesReportIds.length === 0
          ? []
          : database.db
              .selectFrom('sales_report_sales')
              .innerJoin('report_listings', 'report_listings.id', 'report_listing_id')
              .select([
                'sales_report_sales.earnings_kopecks',
                'sales_report_sales.outlet_share_kopecks',
                'report_listings.product_id',
                'sales_report_sales.report_id',
                'sales_report_sales.report_listing_id',
                'sales_report_sales.units_sold',
              ])
              .where('report_id', 'in', salesReportIds)
              .execute(),
        stockReportIds.length === 0
          ? []
          : database.db
              .selectFrom('sales_report_stock_balances')
              .innerJoin('report_listings', 'report_listings.id', 'report_listing_id')
              .select([
                'report_listings.product_id',
                'sales_report_stock_balances.report_id',
                'sales_report_stock_balances.report_listing_id',
                'sales_report_stock_balances.stock_balance',
              ])
              .where('report_id', 'in', stockReportIds)
              .execute(),
      ]);

      const currentByProduct = new Map<string, Metrics>();
      const currentTotals = emptyMetrics();
      const previousTotals = emptyMetrics();
      const unmappedListingIds = new Set<string>();
      const includeProduct = (productId: string | null): productId is string =>
        productId !== null &&
        (selectedProductIds === undefined || selectedProductIds.has(productId));
      const currentMetrics = (productId: string): Metrics => {
        const metrics = currentByProduct.get(productId) ?? emptyMetrics();
        currentByProduct.set(productId, metrics);
        return metrics;
      };

      for (const sale of sales) {
        const current = currentSalesReportIds.has(sale.report_id);
        const prior = previousSalesReportIds.has(sale.report_id);
        if (current && sale.product_id === null) {
          unmappedListingIds.add(sale.report_listing_id);
        }
        if (!includeProduct(sale.product_id)) continue;
        const values = {
          earningsKopecks: sale.earnings_kopecks,
          outletShareKopecks: sale.outlet_share_kopecks,
          unitsSold: sale.units_sold,
        };
        if (current) {
          addMetrics(currentMetrics(sale.product_id), values);
          addMetrics(currentTotals, values);
        }
        if (prior) addMetrics(previousTotals, values);
      }
      for (const stock of stockBalances) {
        const current = currentStockReportIds.has(stock.report_id);
        const prior = previousStockReportIds.has(stock.report_id);
        if (current && stock.product_id === null) {
          unmappedListingIds.add(stock.report_listing_id);
        }
        if (!includeProduct(stock.product_id)) continue;
        const values = { currentStockBalance: stock.stock_balance };
        if (current) {
          addMetrics(currentMetrics(stock.product_id), values);
          addMetrics(currentTotals, values);
        }
        if (prior) addMetrics(previousTotals, values);
      }

      const productsById = new Map(productRows.map((product) => [product.id, product]));
      return {
        outlets: outletRows.map((outlet) => create(AnalyticsOutletOptionSchema, outlet)),
        previousPeriodEndDate: previous.end,
        previousPeriodStartDate: previous.start,
        previousPeriodTotals: metricsToProtobuf(previousTotals),
        products: optionProductRows.map((product) =>
          create(AnalyticsProductOptionSchema, {
            archived: product.archived_at_ms !== null,
            id: product.id,
            name: product.name,
          }),
        ),
        rows: productRows.flatMap((product) => {
          const metrics = currentByProduct.get(product.id);
          if (metrics === undefined || productsById.get(product.id) === undefined) return [];
          return [
            create(ProductAnalyticsRowSchema, {
              metrics: metricsToProtobuf(metrics),
              product: create(AnalyticsProductOptionSchema, {
                archived: product.archived_at_ms !== null,
                id: product.id,
                name: product.name,
              }),
            }),
          ];
        }),
        totals: metricsToProtobuf(currentTotals),
        unmappedListingCount: unmappedListingIds.size,
      };
    },
  };
}

export function registerAnalyticsRoutes(
  router: ConnectRouter,
  dependencies: AnalyticsRouteDependencies,
): void {
  router.service(AnalyticsService, createAnalyticsService(dependencies));
}
