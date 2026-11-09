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

export const migrationProvider: MigrationProvider = {
  async getMigrations() {
    return {
      '001_create_products': createProducts,
      '002_archive_products': archiveProducts,
      '003_create_outlets': createOutlets,
    };
  },
};
