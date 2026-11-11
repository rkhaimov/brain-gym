import type { ConnectRouter, ServiceImpl } from '@connectrpc/connect';

import { OutletListingService } from '../../shared/gen/ceramics/v1/outlet_listing_pb.js';
import type { ApplicationDatabase } from '../database/database.js';

export interface OutletListingRouteDependencies {
  readonly database: ApplicationDatabase;
}

function createOutletListingService(
  dependencies: OutletListingRouteDependencies,
): ServiceImpl<typeof OutletListingService> {
  const { database } = dependencies;
  return {
    async listOutletListings(request) {
      const listings = await database.db
        .selectFrom('outlet_listings')
        .select(['created_at_ms', 'id', 'name', 'outlet_id'])
        .where('outlet_id', '=', request.outletId)
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
        .innerJoin('outlet_listings', 'outlet_listings.id', 'outlet_listing_id')
        .select([
          'sales_report_sales.outlet_listing_id',
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
        .innerJoin('outlet_listings', 'outlet_listings.id', 'outlet_listing_id')
        .select([
          'sales_report_stock_balances.outlet_listing_id',
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
        if (!lastPrice.has(stock.outlet_listing_id)) {
          lastPrice.set(stock.outlet_listing_id, stock.outlet_price_kopecks);
        }
      });
      const latestSales = new Map(
        sales
          .filter((sale) => sale.report_id === latestReportId)
          .map((sale) => [sale.outlet_listing_id, sale]),
      );
      const latestStockBalances = new Map(
        stockBalances
          .filter((stock) => stock.report_id === latestReportId)
          .map((stock) => [stock.outlet_listing_id, stock]),
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
            outletId: listing.outlet_id,
          };
        }),
      };
    },
  };
}

export function registerOutletListingRoutes(
  router: ConnectRouter,
  dependencies: OutletListingRouteDependencies,
): void {
  router.service(OutletListingService, createOutletListingService(dependencies));
}
