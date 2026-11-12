import { create } from '@bufbuild/protobuf';
import type { ConnectRouter, ServiceImpl } from '@connectrpc/connect';
import type { Kysely, Selectable, Transaction } from 'kysely';

import {
  CreateSalesReportRequestSchema,
  SalesEntrySchema,
  SalesReportMutationFailureField,
  SalesReportMutationFailureSchema,
  SalesReportSchema,
  SalesReportService,
  StockBalanceEntrySchema,
} from '../../shared/gen/ceramics/v1/sales_report_pb.js';
import type {
  CreateSalesReportRequest,
  SalesReport,
} from '../../shared/gen/ceramics/v1/sales_report_pb.js';
import { normalizeSalesReport, validateSalesReport } from '../../shared/sales-report-validation.js';
import type { SalesReportValidationIssue } from '../../shared/sales-report-validation.js';
import type { ApplicationDatabase } from '../database/database.js';
import type {
  DB,
  ReportListings,
  SalesReports,
  SalesReportSales,
  SalesReportStockBalances,
} from '../database/generated.js';
import type { EnvService } from '../env.js';
import type { MutationQueue } from '../mutation-queue.js';

const OUTLET_NOT_AVAILABLE_MESSAGE = 'Выберите действующий магазин';
const REPORT_NOT_FOUND_MESSAGE = 'Отчёт не найден';
const REPORT_ARCHIVED_MESSAGE = 'Сначала восстановите отчёт';

export interface SalesReportRouteDependencies {
  readonly database: ApplicationDatabase;
  readonly env: EnvService;
  readonly mutationQueue: MutationQueue;
}

type Report = Readonly<
  Pick<
    Selectable<SalesReports>,
    | 'archived_at_ms'
    | 'created_at_ms'
    | 'id'
    | 'outlet_id'
    | 'period_end_date'
    | 'period_start_date'
    | 'updated_at_ms'
  >
>;

type ListingIdentity = Readonly<Pick<Selectable<ReportListings>, 'created_at_ms' | 'id' | 'name'>>;

type StoredSale = Readonly<
  Pick<
    Selectable<SalesReportSales>,
    'earnings_kopecks' | 'outlet_share_kopecks' | 'report_listing_id' | 'units_sold'
  > &
    Pick<Selectable<ReportListings>, 'created_at_ms' | 'name'>
>;

type StoredStockBalance = Readonly<
  Pick<
    Selectable<SalesReportStockBalances>,
    'outlet_price_kopecks' | 'report_listing_id' | 'stock_balance'
  > &
    Pick<Selectable<ReportListings>, 'created_at_ms' | 'name'>
>;

function compareListings(
  left: Readonly<Pick<Selectable<ReportListings>, 'created_at_ms' | 'name'>>,
  right: Readonly<Pick<Selectable<ReportListings>, 'created_at_ms' | 'name'>>,
): number {
  return (
    left.created_at_ms - right.created_at_ms ||
    (left.name < right.name ? -1 : left.name > right.name ? 1 : 0)
  );
}

function reportToProtobuf(
  report: Report,
  sales: readonly StoredSale[],
  stockBalances: readonly StoredStockBalance[],
): SalesReport {
  return create(SalesReportSchema, {
    archived: report.archived_at_ms !== null,
    createdAtMs: report.created_at_ms,
    id: report.id,
    outletId: report.outlet_id,
    periodEndDate: report.period_end_date,
    periodStartDate: report.period_start_date,
    sales: sales.toSorted(compareListings).map((sale) =>
      create(SalesEntrySchema, {
        earningsKopecks: sale.earnings_kopecks,
        listingName: sale.name,
        outletShareKopecks: sale.outlet_share_kopecks,
        salesValueKopecks: sale.earnings_kopecks + sale.outlet_share_kopecks,
        unitsSold: sale.units_sold,
      }),
    ),
    stockBalances: stockBalances.toSorted(compareListings).map((stock) =>
      create(StockBalanceEntrySchema, {
        listingName: stock.name,
        outletPriceKopecks: stock.outlet_price_kopecks,
        stockBalance: stock.stock_balance,
      }),
    ),
    updatedAtMs: report.updated_at_ms,
  });
}

function reportFailure(issue: SalesReportValidationIssue) {
  return {
    result: {
      case: 'failure' as const,
      value: create(SalesReportMutationFailureSchema, {
        field: issue.field,
        message: issue.message,
        ...(issue.rowIndex === undefined ? {} : { rowIndex: issue.rowIndex }),
        ...(issue.section === undefined ? {} : { section: issue.section }),
      }),
    },
  };
}

async function nextSavedAtMs(transaction: Transaction<DB>, env: EnvService): Promise<number> {
  const latest = await transaction
    .selectFrom('sales_reports')
    .select(({ fn }) => fn.max<number>('updated_at_ms').as('updated_at_ms'))
    .executeTakeFirst();
  return Math.max(env.now().getTime(), (latest?.updated_at_ms ?? -1) + 1);
}

async function resolveListings(
  transaction: Transaction<DB>,
  env: EnvService,
  request: CreateSalesReportRequest,
): Promise<Map<string, ListingIdentity>> {
  const listings = new Map<string, ListingIdentity>();
  const latestListing = await transaction
    .selectFrom('report_listings')
    .select(({ fn }) => fn.max<number>('created_at_ms').as('created_at_ms'))
    .executeTakeFirst();
  let nextCreatedAtMs = Math.max(env.now().getTime(), (latestListing?.created_at_ms ?? -1) + 1);
  const listingNames = new Set([
    ...request.sales.map((sale) => sale.listingName),
    ...request.stockBalances.map((stock) => stock.listingName),
  ]);
  for (const listingName of listingNames) {
    let reportListing = await transaction
      .selectFrom('report_listings')
      .select(['created_at_ms', 'id', 'name'])
      .where('name', '=', listingName)
      .executeTakeFirst();
    if (reportListing === undefined) {
      reportListing = {
        created_at_ms: nextCreatedAtMs++,
        id: env.randomUUID(),
        name: listingName,
      };
      await transaction
        .insertInto('report_listings')
        .values({
          created_at_ms: reportListing.created_at_ms,
          id: reportListing.id,
          name: reportListing.name,
        })
        .executeTakeFirstOrThrow();
    }
    listings.set(listingName, reportListing);
  }
  return listings;
}

async function replaceReportContents(
  transaction: Transaction<DB>,
  reportId: string,
  request: CreateSalesReportRequest,
  listings: ReadonlyMap<string, ListingIdentity>,
): Promise<
  Readonly<{ sales: readonly StoredSale[]; stockBalances: readonly StoredStockBalance[] }>
> {
  await transaction.deleteFrom('sales_report_sales').where('report_id', '=', reportId).execute();
  await transaction
    .deleteFrom('sales_report_stock_balances')
    .where('report_id', '=', reportId)
    .execute();

  const sales = request.sales.map((sale): StoredSale => {
    const listing = listings.get(sale.listingName);
    if (listing === undefined) throw new Error('Resolved Sales listing is missing');
    return {
      created_at_ms: listing.created_at_ms,
      earnings_kopecks: sale.earningsKopecks,
      name: listing.name,
      report_listing_id: listing.id,
      outlet_share_kopecks: sale.salesValueKopecks - sale.earningsKopecks,
      units_sold: sale.unitsSold,
    };
  });
  if (sales.length > 0) {
    await transaction
      .insertInto('sales_report_sales')
      .values(
        sales.map((sale) => ({
          earnings_kopecks: sale.earnings_kopecks,
          report_listing_id: sale.report_listing_id,
          outlet_share_kopecks: sale.outlet_share_kopecks,
          report_id: reportId,
          units_sold: sale.units_sold,
        })),
      )
      .execute();
  }

  const stockBalances = request.stockBalances.map((stock): StoredStockBalance => {
    const listing = listings.get(stock.listingName);
    if (listing === undefined) throw new Error('Resolved Stock-balance listing is missing');
    return {
      created_at_ms: listing.created_at_ms,
      name: listing.name,
      report_listing_id: listing.id,
      outlet_price_kopecks: stock.outletPriceKopecks,
      stock_balance: stock.stockBalance,
    };
  });
  if (stockBalances.length > 0) {
    await transaction
      .insertInto('sales_report_stock_balances')
      .values(
        stockBalances.map((stock) => ({
          report_listing_id: stock.report_listing_id,
          outlet_price_kopecks: stock.outlet_price_kopecks,
          report_id: reportId,
          stock_balance: stock.stock_balance,
        })),
      )
      .execute();
  }

  return { sales, stockBalances };
}

async function loadReportContents(
  database: Kysely<DB> | Transaction<DB>,
  reportId: string,
): Promise<
  Readonly<{ sales: readonly StoredSale[]; stockBalances: readonly StoredStockBalance[] }>
> {
  const sales = await database
    .selectFrom('sales_report_sales')
    .innerJoin('report_listings', 'report_listings.id', 'report_listing_id')
    .select([
      'report_listings.created_at_ms',
      'sales_report_sales.earnings_kopecks',
      'report_listings.name',
      'sales_report_sales.report_listing_id',
      'sales_report_sales.outlet_share_kopecks',
      'sales_report_sales.units_sold',
    ])
    .where('report_id', '=', reportId)
    .execute();
  const stockBalances = await database
    .selectFrom('sales_report_stock_balances')
    .innerJoin('report_listings', 'report_listings.id', 'report_listing_id')
    .select([
      'report_listings.created_at_ms',
      'report_listings.name',
      'sales_report_stock_balances.report_listing_id',
      'sales_report_stock_balances.outlet_price_kopecks',
      'sales_report_stock_balances.stock_balance',
    ])
    .where('report_id', '=', reportId)
    .execute();
  return { sales, stockBalances };
}

function createSalesReportService(
  dependencies: SalesReportRouteDependencies,
): ServiceImpl<typeof SalesReportService> {
  const { database, env, mutationQueue } = dependencies;

  return {
    async createSalesReport(rawRequest) {
      const request = normalizeSalesReport(rawRequest);
      const validationFailure = validateSalesReport(request)[0];
      if (validationFailure !== undefined) return reportFailure(validationFailure);

      return mutationQueue.run(async () =>
        database.db.transaction().execute(async (transaction) => {
          const outlet = await transaction
            .selectFrom('outlets')
            .select('id')
            .where('id', '=', request.outletId)
            .where('archived_at_ms', 'is', null)
            .executeTakeFirst();
          if (outlet === undefined) {
            return reportFailure({
              field: SalesReportMutationFailureField.OUTLET,
              message: OUTLET_NOT_AVAILABLE_MESSAGE,
            });
          }

          const listings = await resolveListings(transaction, env, request);
          const timestamp = await nextSavedAtMs(transaction, env);
          const report = {
            archived_at_ms: null,
            created_at_ms: timestamp,
            id: env.randomUUID(),
            outlet_id: request.outletId,
            period_end_date: request.periodEndDate,
            period_start_date: request.periodStartDate,
            updated_at_ms: timestamp,
          } satisfies Selectable<SalesReports>;
          await transaction.insertInto('sales_reports').values(report).executeTakeFirstOrThrow();
          const { sales, stockBalances } = await replaceReportContents(
            transaction,
            report.id,
            request,
            listings,
          );

          return {
            result: {
              case: 'success' as const,
              value: reportToProtobuf(report, sales, stockBalances),
            },
          };
        }),
      );
    },

    async updateSalesReport(rawRequest) {
      return mutationQueue.run(async () =>
        database.db.transaction().execute(async (transaction) => {
          const existing = await transaction
            .selectFrom('sales_reports')
            .selectAll()
            .where('id', '=', rawRequest.id)
            .executeTakeFirst();
          if (existing === undefined) {
            return reportFailure({
              field: SalesReportMutationFailureField.UNSPECIFIED,
              message: REPORT_NOT_FOUND_MESSAGE,
            });
          }
          if (existing.archived_at_ms !== null) {
            return reportFailure({
              field: SalesReportMutationFailureField.UNSPECIFIED,
              message: REPORT_ARCHIVED_MESSAGE,
            });
          }

          const request = normalizeSalesReport(
            create(CreateSalesReportRequestSchema, {
              outletId: existing.outlet_id,
              periodEndDate: rawRequest.periodEndDate,
              periodStartDate: rawRequest.periodStartDate,
              sales: rawRequest.sales,
              stockBalances: rawRequest.stockBalances,
            }),
          );
          const validationFailure = validateSalesReport(request)[0];
          if (validationFailure !== undefined) return reportFailure(validationFailure);

          const listings = await resolveListings(transaction, env, request);
          const report: Report = {
            ...existing,
            period_end_date: request.periodEndDate,
            period_start_date: request.periodStartDate,
            updated_at_ms: await nextSavedAtMs(transaction, env),
          };
          await transaction
            .updateTable('sales_reports')
            .set({
              period_end_date: report.period_end_date,
              period_start_date: report.period_start_date,
              updated_at_ms: report.updated_at_ms,
            })
            .where('id', '=', report.id)
            .executeTakeFirstOrThrow();
          const { sales, stockBalances } = await replaceReportContents(
            transaction,
            report.id,
            request,
            listings,
          );
          return {
            result: {
              case: 'success' as const,
              value: reportToProtobuf(report, sales, stockBalances),
            },
          };
        }),
      );
    },

    async setSalesReportArchived(request) {
      return mutationQueue.run(async () =>
        database.db.transaction().execute(async (transaction) => {
          const report = await transaction
            .updateTable('sales_reports')
            .set({ archived_at_ms: request.archived ? env.now().getTime() : null })
            .where('id', '=', request.id)
            .returningAll()
            .executeTakeFirst();
          if (report === undefined) {
            return reportFailure({
              field: SalesReportMutationFailureField.UNSPECIFIED,
              message: REPORT_NOT_FOUND_MESSAGE,
            });
          }
          const { sales, stockBalances } = await loadReportContents(transaction, report.id);
          return {
            result: {
              case: 'success' as const,
              value: reportToProtobuf(report, sales, stockBalances),
            },
          };
        }),
      );
    },

    async getSalesReport(request) {
      const report = await database.db
        .selectFrom('sales_reports')
        .selectAll()
        .where('id', '=', request.id)
        .executeTakeFirst();
      if (report === undefined) {
        return reportFailure({
          field: SalesReportMutationFailureField.UNSPECIFIED,
          message: REPORT_NOT_FOUND_MESSAGE,
        });
      }
      const { sales, stockBalances } = await loadReportContents(database.db, report.id);

      return {
        result: {
          case: 'success' as const,
          value: reportToProtobuf(report, sales, stockBalances),
        },
      };
    },

    async listSalesReports(request) {
      const reports = await database.db
        .selectFrom('sales_reports')
        .selectAll()
        .where('outlet_id', '=', request.outletId)
        .where('archived_at_ms', request.archived ? 'is not' : 'is', null)
        .orderBy('period_end_date', 'desc')
        .orderBy('updated_at_ms', 'desc')
        .orderBy('id', 'desc')
        .execute();
      if (reports.length === 0) return { reports: [] };

      const reportIds = reports.map((report) => report.id);
      const sales = await database.db
        .selectFrom('sales_report_sales')
        .select(['report_id', 'report_listing_id'])
        .where('report_id', 'in', reportIds)
        .execute();
      const stockBalances = await database.db
        .selectFrom('sales_report_stock_balances')
        .select(['report_id', 'report_listing_id'])
        .where('report_id', 'in', reportIds)
        .execute();
      const listingIdsByReport = new Map<string, Set<string>>();
      for (const row of [...sales, ...stockBalances]) {
        const listingIds = listingIdsByReport.get(row.report_id) ?? new Set<string>();
        listingIds.add(row.report_listing_id);
        listingIdsByReport.set(row.report_id, listingIds);
      }

      return {
        reports: reports.map((report) => ({
          archived: report.archived_at_ms !== null,
          createdAtMs: report.created_at_ms,
          id: report.id,
          listingCount: listingIdsByReport.get(report.id)?.size ?? 0,
          outletId: report.outlet_id,
          periodEndDate: report.period_end_date,
          periodStartDate: report.period_start_date,
          updatedAtMs: report.updated_at_ms,
        })),
      };
    },
  };
}

export function registerSalesReportRoutes(
  router: ConnectRouter,
  dependencies: SalesReportRouteDependencies,
): void {
  router.service(SalesReportService, createSalesReportService(dependencies));
}
