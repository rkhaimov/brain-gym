import { sql } from 'kysely';
import type { Migration, MigrationProvider } from 'kysely/migration';

const createProducts: Migration = {
  async up(database) {
    await database.schema
      .createTable('products')
      .addColumn('id', 'text', (column) => column.primaryKey().notNull())
      .addColumn('name', sql`text collate binary`, (column) => column.notNull())
      .addColumn('created_at_ms', 'integer', (column) => column.notNull())
      .execute();
    await database.schema
      .createIndex('products_name_unique')
      .unique()
      .on('products')
      .column('name')
      .execute();
  },
};

const archiveProducts: Migration = {
  async up(database) {
    await database.schema.alterTable('products').addColumn('archived_at_ms', 'integer').execute();
  },
};

const createOutlets: Migration = {
  async up(database) {
    await database.schema
      .createTable('outlets')
      .addColumn('id', 'text', (column) => column.primaryKey().notNull())
      .addColumn('name', sql`text collate binary`, (column) => column.notNull())
      .addColumn('code', sql`text collate binary`)
      .addColumn('created_at_ms', 'integer', (column) => column.notNull())
      .addColumn('archived_at_ms', 'integer')
      .execute();
    await database.schema
      .createIndex('outlets_name_unique')
      .unique()
      .on('outlets')
      .column('name')
      .execute();
    await database.schema
      .createIndex('outlets_code_unique')
      .unique()
      .on('outlets')
      .column('code')
      .execute();
  },
};

const createSalesReports: Migration = {
  async up(database) {
    await database.schema
      .createTable('sales_reports')
      .addColumn('id', 'text', (column) => column.primaryKey().notNull())
      .addColumn('outlet_id', 'text', (column) =>
        column.notNull().references('outlets.id').onDelete('restrict'),
      )
      .addColumn('period_start_date', 'text', (column) => column.notNull())
      .addColumn('period_end_date', 'text', (column) => column.notNull())
      .addColumn('created_at_ms', 'integer', (column) => column.notNull())
      .execute();
    await database.schema
      .createTable('sales_report_listings')
      .addColumn('report_id', 'text', (column) =>
        column.notNull().references('sales_reports.id').onDelete('cascade'),
      )
      .addColumn('listing_name', sql`text collate binary`, (column) => column.notNull())
      .addColumn('outlet_price_kopecks', 'integer', (column) => column.notNull())
      .addColumn('units_sold', 'integer')
      .addColumn('earnings_kopecks', 'integer')
      .addColumn('stock_balance', 'integer')
      .addColumn('sales_position', 'integer')
      .addColumn('stock_position', 'integer')
      .addPrimaryKeyConstraint('sales_report_listings_primary', ['report_id', 'listing_name'])
      .execute();
    await database.schema
      .createIndex('sales_reports_outlet')
      .on('sales_reports')
      .columns(['outlet_id', 'created_at_ms'])
      .execute();
  },
};

export const migrationProvider: MigrationProvider = {
  async getMigrations() {
    return {
      '001_create_products': createProducts,
      '002_archive_products': archiveProducts,
      '003_create_outlets': createOutlets,
      '004_create_sales_reports': createSalesReports,
    };
  },
};
