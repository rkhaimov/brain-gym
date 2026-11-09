import { create } from '@bufbuild/protobuf';
import type { ConnectRouter, ServiceImpl } from '@connectrpc/connect';

import {
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
import { validateSalesReport } from '../../shared/sales-report-validation.js';
import type { SalesReportValidationIssue } from '../../shared/sales-report-validation.js';
import type { ApplicationDatabase } from '../database/database.js';
import type { SalesReportListings } from '../database/generated.js';
import type { EnvService } from '../env.js';
import type { MutationQueue } from '../mutation-queue.js';

const OUTLET_NOT_AVAILABLE_MESSAGE = 'Выберите действующую торговую точку';
const REPORT_NOT_FOUND_MESSAGE = 'Отчёт не найден';

export interface SalesReportRouteDependencies {
  readonly database: ApplicationDatabase;
  readonly env: EnvService;
  readonly mutationQueue: MutationQueue;
}

type NormalizedListing = Readonly<
  Pick<
    SalesReportListings,
    | 'earnings_kopecks'
    | 'listing_name'
    | 'outlet_price_kopecks'
    | 'sales_position'
    | 'stock_balance'
    | 'stock_position'
    | 'units_sold'
  >
>;

function normalizeListings(request: CreateSalesReportRequest): NormalizedListing[] {
  const listings = new Map<string, NormalizedListing>();
  request.sales.forEach((sale, salesPosition) => {
    const stock = request.stockBalances.find(
      (candidate) => candidate.listingName === sale.listingName,
    );
    listings.set(sale.listingName, {
      earnings_kopecks: sale.earningsKopecks,
      listing_name: sale.listingName,
      outlet_price_kopecks: stock?.outletPriceKopecks ?? sale.outletPriceKopecks ?? 0,
      sales_position: salesPosition,
      stock_balance: stock?.stockBalance ?? null,
      stock_position: stock === undefined ? null : request.stockBalances.indexOf(stock),
      units_sold: sale.unitsSold,
    });
  });
  request.stockBalances.forEach((stock, stockPosition) => {
    if (listings.has(stock.listingName)) return;
    listings.set(stock.listingName, {
      earnings_kopecks: null,
      listing_name: stock.listingName,
      outlet_price_kopecks: stock.outletPriceKopecks,
      sales_position: null,
      stock_balance: stock.stockBalance,
      stock_position: stockPosition,
      units_sold: null,
    });
  });
  return [...listings.values()];
}

function reportToProtobuf(
  report: Readonly<Pick<SalesReport, 'id' | 'outletId' | 'periodEndDate' | 'periodStartDate'>>,
  listings: readonly NormalizedListing[],
): SalesReport {
  const sales = listings
    .filter((listing) => listing.sales_position !== null)
    .toSorted((left, right) => (left.sales_position ?? 0) - (right.sales_position ?? 0))
    .map((listing) =>
      create(SalesEntrySchema, {
        earningsKopecks: listing.earnings_kopecks ?? 0,
        listingName: listing.listing_name,
        outletPriceKopecks: listing.outlet_price_kopecks,
        outletShareKopecks:
          (listing.units_sold ?? 0) * listing.outlet_price_kopecks -
          (listing.earnings_kopecks ?? 0),
        unitsSold: listing.units_sold ?? 0,
      }),
    );
  const stockBalances = listings
    .filter((listing) => listing.stock_position !== null)
    .toSorted((left, right) => (left.stock_position ?? 0) - (right.stock_position ?? 0))
    .map((listing) =>
      create(StockBalanceEntrySchema, {
        listingName: listing.listing_name,
        outletPriceKopecks: listing.outlet_price_kopecks,
        stockBalance: listing.stock_balance ?? 0,
      }),
    );
  return create(SalesReportSchema, { ...report, sales, stockBalances });
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

function createSalesReportService(
  dependencies: SalesReportRouteDependencies,
): ServiceImpl<typeof SalesReportService> {
  const { database, env, mutationQueue } = dependencies;

  return {
    async createSalesReport(request) {
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

          const id = env.randomUUID();
          const listings = normalizeListings(request);
          await transaction
            .insertInto('sales_reports')
            .values({
              created_at_ms: env.now().getTime(),
              id,
              outlet_id: request.outletId,
              period_end_date: request.periodEndDate,
              period_start_date: request.periodStartDate,
            })
            .executeTakeFirstOrThrow();
          if (listings.length > 0) {
            await transaction
              .insertInto('sales_report_listings')
              .values(listings.map((listing) => ({ ...listing, report_id: id })))
              .execute();
          }

          return {
            result: {
              case: 'success' as const,
              value: reportToProtobuf(
                {
                  id,
                  outletId: request.outletId,
                  periodEndDate: request.periodEndDate,
                  periodStartDate: request.periodStartDate,
                },
                listings,
              ),
            },
          };
        }),
      );
    },

    async getSalesReport(request) {
      const report = await database.db
        .selectFrom('sales_reports')
        .select(['id', 'outlet_id', 'period_end_date', 'period_start_date'])
        .where('id', '=', request.id)
        .executeTakeFirst();
      if (report === undefined) {
        return reportFailure({
          field: SalesReportMutationFailureField.UNSPECIFIED,
          message: REPORT_NOT_FOUND_MESSAGE,
        });
      }
      const listings = await database.db
        .selectFrom('sales_report_listings')
        .select([
          'earnings_kopecks',
          'listing_name',
          'outlet_price_kopecks',
          'sales_position',
          'stock_balance',
          'stock_position',
          'units_sold',
        ])
        .where('report_id', '=', report.id)
        .execute();

      return {
        result: {
          case: 'success' as const,
          value: reportToProtobuf(
            {
              id: report.id,
              outletId: report.outlet_id,
              periodEndDate: report.period_end_date,
              periodStartDate: report.period_start_date,
            },
            listings,
          ),
        },
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
