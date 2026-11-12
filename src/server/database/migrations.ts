import { sql } from 'kysely';
import type { Migration, MigrationProvider } from 'kysely/migration';

const createSchema: Migration = {
  async up(database) {
    await database.schema
      .createTable('products')
      .addColumn('id', 'text', (column) => column.primaryKey().notNull())
      .addColumn('name', sql`text collate binary`, (column) => column.notNull())
      .addColumn('created_at_ms', 'integer', (column) => column.notNull())
      .addColumn('archived_at_ms', 'integer')
      .addUniqueConstraint('products_name_unique', ['name'])
      .execute();

    await database.schema
      .createTable('outlets')
      .addColumn('id', 'text', (column) => column.primaryKey().notNull())
      .addColumn('name', sql`text collate binary`, (column) => column.notNull())
      .addColumn('code', sql`text collate binary`)
      .addColumn('created_at_ms', 'integer', (column) => column.notNull())
      .addColumn('archived_at_ms', 'integer')
      .addUniqueConstraint('outlets_name_unique', ['name'])
      .addUniqueConstraint('outlets_code_unique', ['code'])
      .execute();

    await database.schema
      .createTable('report_listings')
      .addColumn('id', 'text', (column) => column.primaryKey().notNull())
      .addColumn('name', sql`text collate binary`, (column) => column.notNull())
      .addColumn('created_at_ms', 'integer', (column) => column.notNull())
      .addColumn('product_id', 'text', (column) =>
        column.references('products.id').onDelete('restrict'),
      )
      .addUniqueConstraint('report_listings_name_unique', ['name'])
      .addCheckConstraint('report_listings_name_nonempty', sql`length(name) > 0`)
      .execute();

    await database.schema
      .createTable('sales_reports')
      .addColumn('id', 'text', (column) => column.primaryKey().notNull())
      .addColumn('outlet_id', 'text', (column) =>
        column.notNull().references('outlets.id').onDelete('restrict'),
      )
      .addColumn('period_start_date', 'text', (column) => column.notNull())
      .addColumn('period_end_date', 'text', (column) => column.notNull())
      .addColumn('created_at_ms', 'integer', (column) => column.notNull())
      .addColumn('updated_at_ms', 'integer', (column) => column.notNull())
      .addColumn('archived_at_ms', 'integer')
      .execute();

    await database.schema
      .createTable('sales_report_sales')
      .addColumn('report_id', 'text', (column) =>
        column.notNull().references('sales_reports.id').onDelete('cascade'),
      )
      .addColumn('report_listing_id', 'text', (column) =>
        column.notNull().references('report_listings.id').onDelete('restrict'),
      )
      .addColumn('units_sold', 'integer', (column) => column.notNull().defaultTo(0))
      .addColumn('earnings_kopecks', 'integer', (column) => column.notNull().defaultTo(0))
      .addColumn('outlet_share_kopecks', 'integer', (column) => column.notNull().defaultTo(0))
      .addPrimaryKeyConstraint('sales_report_sales_primary', ['report_id', 'report_listing_id'])
      .addCheckConstraint('sales_report_sales_units_nonnegative', sql`units_sold >= 0`)
      .addCheckConstraint('sales_report_sales_earnings_nonnegative', sql`earnings_kopecks >= 0`)
      .addCheckConstraint(
        'sales_report_sales_outlet_share_nonnegative',
        sql`outlet_share_kopecks >= 0`,
      )
      .execute();

    await database.schema
      .createTable('sales_report_stock_balances')
      .addColumn('report_id', 'text', (column) =>
        column.notNull().references('sales_reports.id').onDelete('cascade'),
      )
      .addColumn('report_listing_id', 'text', (column) =>
        column.notNull().references('report_listings.id').onDelete('restrict'),
      )
      .addColumn('stock_balance', 'integer', (column) => column.notNull().defaultTo(0))
      .addColumn('outlet_price_kopecks', 'integer', (column) => column.notNull().defaultTo(0))
      .addPrimaryKeyConstraint('sales_report_stock_balances_primary', [
        'report_id',
        'report_listing_id',
      ])
      .addCheckConstraint('sales_report_stock_balances_stock_nonnegative', sql`stock_balance >= 0`)
      .addCheckConstraint(
        'sales_report_stock_balances_price_nonnegative',
        sql`outlet_price_kopecks >= 0`,
      )
      .execute();
  },
};

export const migrationProvider: MigrationProvider = {
  async getMigrations() {
    return { '001_create_schema': createSchema };
  },
};
