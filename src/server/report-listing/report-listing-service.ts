import type { ConnectRouter, ServiceImpl } from '@connectrpc/connect';

import { ReportListingService } from '../../shared/gen/ceramics/v1/report_listing_pb.js';
import type { ApplicationDatabase } from '../database/database.js';

export interface ReportListingRouteDependencies {
  readonly database: ApplicationDatabase;
}

function createReportListingService(
  dependencies: ReportListingRouteDependencies,
): ServiceImpl<typeof ReportListingService> {
  const { database } = dependencies;
  return {
    async listReportListings(request) {
      const salesMemberships = await database.db
        .selectFrom('sales_report_sales')
        .innerJoin('sales_reports', 'sales_reports.id', 'report_id')
        .select('sales_report_sales.report_listing_id')
        .where('sales_reports.outlet_id', '=', request.outletId)
        .execute();
      const stockMemberships = await database.db
        .selectFrom('sales_report_stock_balances')
        .innerJoin('sales_reports', 'sales_reports.id', 'report_id')
        .select('sales_report_stock_balances.report_listing_id')
        .where('sales_reports.outlet_id', '=', request.outletId)
        .execute();
      const listingIds = new Set([
        ...salesMemberships.map((membership) => membership.report_listing_id),
        ...stockMemberships.map((membership) => membership.report_listing_id),
      ]);
      if (listingIds.size === 0) return { listings: [] };

      const listings = await database.db
        .selectFrom('report_listings')
        .select(['created_at_ms', 'id', 'name'])
        .where('id', 'in', [...listingIds])
        .orderBy('created_at_ms')
        .orderBy('name')
        .execute();
      const reports = await database.db
        .selectFrom('sales_reports')
        .select(['id', 'period_end_date', 'updated_at_ms'])
        .where('outlet_id', '=', request.outletId)
        .where('archived_at_ms', 'is', null)
        .orderBy('period_end_date', 'desc')
        .orderBy('updated_at_ms', 'desc')
        .orderBy('id', 'desc')
        .execute();
      const sales = await database.db
        .selectFrom('sales_report_sales')
        .innerJoin('sales_reports', 'sales_reports.id', 'report_id')
        .select([
          'sales_report_sales.report_listing_id',
          'sales_report_sales.units_sold',
          'sales_report_sales.report_id',
        ])
        .where('sales_reports.outlet_id', '=', request.outletId)
        .where('sales_reports.archived_at_ms', 'is', null)
        .orderBy('sales_reports.period_end_date', 'desc')
        .orderBy('sales_reports.updated_at_ms', 'desc')
        .orderBy('sales_reports.id', 'desc')
        .execute();
      const stockBalances = await database.db
        .selectFrom('sales_report_stock_balances')
        .innerJoin('sales_reports', 'sales_reports.id', 'report_id')
        .select([
          'sales_report_stock_balances.report_listing_id',
          'sales_report_stock_balances.outlet_price_kopecks',
          'sales_report_stock_balances.stock_balance',
          'sales_report_stock_balances.report_id',
        ])
        .where('sales_reports.outlet_id', '=', request.outletId)
        .where('sales_reports.archived_at_ms', 'is', null)
        .orderBy('sales_reports.period_end_date', 'desc')
        .orderBy('sales_reports.updated_at_ms', 'desc')
        .orderBy('sales_reports.id', 'desc')
        .execute();
      const latestReportId = reports[0]?.id;
      const lastPrice = new Map<string, number>();
      stockBalances.forEach((stock) => {
        if (!lastPrice.has(stock.report_listing_id)) {
          lastPrice.set(stock.report_listing_id, stock.outlet_price_kopecks);
        }
      });
      const latestSales = new Map(
        sales
          .filter((sale) => sale.report_id === latestReportId)
          .map((sale) => [sale.report_listing_id, sale]),
      );
      const latestStockBalances = new Map(
        stockBalances
          .filter((stock) => stock.report_id === latestReportId)
          .map((stock) => [stock.report_listing_id, stock]),
      );

      return {
        listings: listings.map((listing) => {
          const latestSale = latestSales.get(listing.id);
          const latestStock = latestStockBalances.get(listing.id);
          return {
            currentStockBalance: latestStock?.stock_balance ?? 0,
            id: listing.id,
            lastOutletPriceKopecks: lastPrice.get(listing.id) ?? 0,
            latestUnitsSold: latestSale?.units_sold ?? 0,
            name: listing.name,
          };
        }),
      };
    },
  };
}

export function registerReportListingRoutes(
  router: ConnectRouter,
  dependencies: ReportListingRouteDependencies,
): void {
  router.service(ReportListingService, createReportListingService(dependencies));
}
