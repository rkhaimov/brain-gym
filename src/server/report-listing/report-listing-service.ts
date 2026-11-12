import { create } from '@bufbuild/protobuf';
import type { ConnectRouter, ServiceImpl } from '@connectrpc/connect';

import {
  ReportListingFilter,
  ReportListingSchema,
  ReportListingService,
} from '../../shared/gen/ceramics/v1/report_listing_pb.js';
import type { ApplicationDatabase } from '../database/database.js';
import type { EnvService } from '../env.js';
import type { MutationQueue } from '../mutation-queue.js';
import { createProductRecord, resolvedProductToProtobuf } from '../product/product-operations.js';
import type { ResolvedProductFields } from '../product/product-operations.js';

const REPORT_LISTING_NOT_FOUND_MESSAGE = 'Позиция отчёта не найдена';
const PRODUCT_NOT_FOUND_MESSAGE = 'Штучка не найдена';
const ARCHIVED_PRODUCT_MESSAGE = 'Нельзя сопоставить архивную штучку';

export interface ReportListingRouteDependencies {
  readonly database: ApplicationDatabase;
  readonly env: EnvService;
  readonly mutationQueue: MutationQueue;
}

interface ListingRow extends ResolvedProductFields {
  readonly created_at_ms: number;
  readonly id: string;
  readonly name: string;
}

interface ListingMetrics {
  readonly currentStockBalance: number;
  readonly lastOutletPriceKopecks: number;
  readonly latestUnitsSold: number;
}

function reportListingFailure(message: string) {
  return { result: { case: 'failure' as const, value: message } };
}

function reportListingToProtobuf(row: ListingRow, metrics: Partial<ListingMetrics> = {}) {
  return create(ReportListingSchema, {
    currentStockBalance: metrics.currentStockBalance ?? 0,
    id: row.id,
    lastOutletPriceKopecks: metrics.lastOutletPriceKopecks ?? 0,
    latestUnitsSold: metrics.latestUnitsSold ?? 0,
    name: row.name,
    product: resolvedProductToProtobuf(row),
  });
}

function selectListing(database: ApplicationDatabase, id: string) {
  return database.db
    .selectFrom('report_listings')
    .leftJoin('products', 'products.id', 'report_listings.product_id')
    .select([
      'report_listings.created_at_ms',
      'report_listings.id',
      'report_listings.name',
      'report_listings.product_id',
      'products.archived_at_ms as product_archived_at_ms',
      'products.name as product_name',
    ])
    .where('report_listings.id', '=', id)
    .executeTakeFirst();
}

async function outletListingIds(database: ApplicationDatabase, outletId: string) {
  const [salesMemberships, stockMemberships] = await Promise.all([
    database.db
      .selectFrom('sales_report_sales')
      .innerJoin('sales_reports', 'sales_reports.id', 'report_id')
      .select('sales_report_sales.report_listing_id')
      .where('sales_reports.outlet_id', '=', outletId)
      .execute(),
    database.db
      .selectFrom('sales_report_stock_balances')
      .innerJoin('sales_reports', 'sales_reports.id', 'report_id')
      .select('sales_report_stock_balances.report_listing_id')
      .where('sales_reports.outlet_id', '=', outletId)
      .execute(),
  ]);
  return [
    ...new Set([
      ...salesMemberships.map(({ report_listing_id }) => report_listing_id),
      ...stockMemberships.map(({ report_listing_id }) => report_listing_id),
    ]),
  ];
}

async function outletMetrics(
  database: ApplicationDatabase,
  outletId: string,
): Promise<ReadonlyMap<string, ListingMetrics>> {
  const [reports, sales, stockBalances] = await Promise.all([
    database.db
      .selectFrom('sales_reports')
      .select(['id', 'period_end_date', 'updated_at_ms'])
      .where('outlet_id', '=', outletId)
      .where('archived_at_ms', 'is', null)
      .orderBy('period_end_date', 'desc')
      .orderBy('updated_at_ms', 'desc')
      .orderBy('id', 'desc')
      .execute(),
    database.db
      .selectFrom('sales_report_sales')
      .innerJoin('sales_reports', 'sales_reports.id', 'report_id')
      .select([
        'sales_report_sales.report_listing_id',
        'sales_report_sales.units_sold',
        'sales_report_sales.report_id',
      ])
      .where('sales_reports.outlet_id', '=', outletId)
      .where('sales_reports.archived_at_ms', 'is', null)
      .orderBy('sales_reports.period_end_date', 'desc')
      .orderBy('sales_reports.updated_at_ms', 'desc')
      .orderBy('sales_reports.id', 'desc')
      .execute(),
    database.db
      .selectFrom('sales_report_stock_balances')
      .innerJoin('sales_reports', 'sales_reports.id', 'report_id')
      .select([
        'sales_report_stock_balances.report_listing_id',
        'sales_report_stock_balances.outlet_price_kopecks',
        'sales_report_stock_balances.stock_balance',
        'sales_report_stock_balances.report_id',
      ])
      .where('sales_reports.outlet_id', '=', outletId)
      .where('sales_reports.archived_at_ms', 'is', null)
      .orderBy('sales_reports.period_end_date', 'desc')
      .orderBy('sales_reports.updated_at_ms', 'desc')
      .orderBy('sales_reports.id', 'desc')
      .execute(),
  ]);

  const latestReportId = reports[0]?.id;
  const listingIds = new Set([
    ...sales.map(({ report_listing_id }) => report_listing_id),
    ...stockBalances.map(({ report_listing_id }) => report_listing_id),
  ]);
  return new Map(
    [...listingIds].map((listingId) => {
      const latestSale = sales.find(
        (sale) => sale.report_id === latestReportId && sale.report_listing_id === listingId,
      );
      const latestStock = stockBalances.find(
        (stock) => stock.report_id === latestReportId && stock.report_listing_id === listingId,
      );
      const lastStock = stockBalances.find((stock) => stock.report_listing_id === listingId);
      return [
        listingId,
        {
          currentStockBalance: latestStock?.stock_balance ?? 0,
          lastOutletPriceKopecks: lastStock?.outlet_price_kopecks ?? 0,
          latestUnitsSold: latestSale?.units_sold ?? 0,
        },
      ] as const;
    }),
  );
}

function createReportListingService(
  dependencies: ReportListingRouteDependencies,
): ServiceImpl<typeof ReportListingService> {
  const { database, env, mutationQueue } = dependencies;

  return {
    async listReportListings(request) {
      const listingIds =
        request.outletId === undefined
          ? undefined
          : await outletListingIds(database, request.outletId);
      if (listingIds?.length === 0) {
        return { allCount: 0, listings: [], mappedCount: 0, unmappedCount: 0 };
      }

      let query = database.db
        .selectFrom('report_listings')
        .leftJoin('products', 'products.id', 'report_listings.product_id')
        .select([
          'report_listings.created_at_ms',
          'report_listings.id',
          'report_listings.name',
          'report_listings.product_id',
          'products.archived_at_ms as product_archived_at_ms',
          'products.name as product_name',
        ]);
      if (listingIds !== undefined) query = query.where('report_listings.id', 'in', listingIds);
      const scopedRows = await query
        .orderBy('report_listings.created_at_ms')
        .orderBy('report_listings.name')
        .execute();
      const mappedCount = scopedRows.filter(({ product_id }) => product_id !== null).length;
      const unmappedCount = scopedRows.length - mappedCount;
      const filteredRows = scopedRows.filter(({ product_id }) => {
        if (request.filter === ReportListingFilter.MAPPED) return product_id !== null;
        if (request.filter === ReportListingFilter.UNMAPPED) return product_id === null;
        return true;
      });
      const metrics =
        request.outletId === undefined
          ? new Map<string, ListingMetrics>()
          : await outletMetrics(database, request.outletId);

      return {
        allCount: scopedRows.length,
        listings: filteredRows.map((row) => reportListingToProtobuf(row, metrics.get(row.id))),
        mappedCount,
        unmappedCount,
      };
    },

    async setReportListingProduct(request) {
      return mutationQueue.run(async () => {
        if (request.productId !== undefined) {
          const product = await database.db
            .selectFrom('products')
            .select(['archived_at_ms', 'id'])
            .where('id', '=', request.productId)
            .executeTakeFirst();
          if (product === undefined) return reportListingFailure(PRODUCT_NOT_FOUND_MESSAGE);
          if (product.archived_at_ms !== null) {
            return reportListingFailure(ARCHIVED_PRODUCT_MESSAGE);
          }
        }
        const updated = await database.db
          .updateTable('report_listings')
          .set({ product_id: request.productId ?? null })
          .where('id', '=', request.reportListingId)
          .executeTakeFirst();
        if (updated.numUpdatedRows === 0n) {
          return reportListingFailure(REPORT_LISTING_NOT_FOUND_MESSAGE);
        }
        const row = await selectListing(database, request.reportListingId);
        if (row === undefined) return reportListingFailure(REPORT_LISTING_NOT_FOUND_MESSAGE);
        return { result: { case: 'success' as const, value: reportListingToProtobuf(row) } };
      });
    },

    async createProductAndMapReportListing(request) {
      return mutationQueue.run(async () =>
        database.db.transaction().execute(async (transaction) => {
          const listing = await transaction
            .selectFrom('report_listings')
            .select(['created_at_ms', 'id', 'name'])
            .where('id', '=', request.reportListingId)
            .executeTakeFirst();
          if (listing === undefined) return reportListingFailure(REPORT_LISTING_NOT_FOUND_MESSAGE);

          const created = await createProductRecord(transaction, env, request.name);
          if (created.case === 'failure') return reportListingFailure(created.message);
          await transaction
            .updateTable('report_listings')
            .set({ product_id: created.product.id })
            .where('id', '=', listing.id)
            .executeTakeFirstOrThrow();
          return {
            result: {
              case: 'success' as const,
              value: create(ReportListingSchema, {
                id: listing.id,
                name: listing.name,
                product: resolvedProductToProtobuf({
                  product_archived_at_ms: null,
                  product_id: created.product.id,
                  product_name: created.product.name,
                }),
              }),
            },
          };
        }),
      );
    },
  };
}

export function registerReportListingRoutes(
  router: ConnectRouter,
  dependencies: ReportListingRouteDependencies,
): void {
  router.service(ReportListingService, createReportListingService(dependencies));
}
