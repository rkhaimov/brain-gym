import { create } from '@bufbuild/protobuf';
import type { ConnectRouter, ServiceImpl } from '@connectrpc/connect';

import { ProductService, ProductSchema } from '../../shared/gen/ceramics/v1/product_pb.js';
import type { ApplicationDatabase } from '../database/database.js';
import type { EnvService } from '../env.js';
import type { MutationQueue } from '../mutation-queue.js';

const NAME_REQUIRED_MESSAGE = 'Введите название штучки';
const NAME_ALREADY_EXISTS_MESSAGE = 'Штучка с таким названием уже существует';

type ProductId = string & { readonly __productId: true };

function assertProductId(value: string): asserts value is ProductId {
  void value;
}

export interface ProductRouteDependencies {
  readonly database: ApplicationDatabase;
  readonly env: EnvService;
  readonly mutationQueue: MutationQueue;
}

interface DomainProduct {
  readonly id: ProductId;
  readonly name: string;
}

interface PersistedProduct {
  readonly id: string;
  readonly name: string;
}

function productFromDatabase(row: PersistedProduct): DomainProduct {
  const id = row.id;
  assertProductId(id);
  return { id, name: row.name };
}

function productToProtobuf(product: DomainProduct) {
  return create(ProductSchema, {
    id: product.id,
    name: product.name,
  });
}

function productFailure(message: string) {
  return { result: { case: 'failure' as const, value: message } };
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'SQLITE_CONSTRAINT_UNIQUE';
}

function createProductService(
  dependencies: ProductRouteDependencies,
): ServiceImpl<typeof ProductService> {
  const { database, env, mutationQueue } = dependencies;

  return {
    async createProduct(request) {
      if (request.name.length === 0) {
        return productFailure(NAME_REQUIRED_MESSAGE);
      }

      return mutationQueue.run(async () => {
        try {
          return await database.db.transaction().execute(async (transaction) => {
            const existing = await transaction
              .selectFrom('products')
              .select('id')
              .where('name', '=', request.name)
              .executeTakeFirst();
            if (existing !== undefined) {
              return productFailure(NAME_ALREADY_EXISTS_MESSAGE);
            }

            const id = env.randomUUID();
            assertProductId(id);
            const product: DomainProduct = { id, name: request.name };
            await transaction
              .insertInto('products')
              .values({
                created_at_ms: env.now().getTime(),
                id: product.id,
                name: product.name,
              })
              .executeTakeFirstOrThrow();

            return {
              result: { case: 'success' as const, value: productToProtobuf(product) },
            };
          });
        } catch (error) {
          if (isUniqueConstraintError(error)) {
            return productFailure(NAME_ALREADY_EXISTS_MESSAGE);
          }
          throw error;
        }
      });
    },

    async listProducts() {
      const rows = await database.db
        .selectFrom('products')
        .select(['id', 'name'])
        .orderBy('created_at_ms', 'asc')
        .orderBy('id', 'asc')
        .execute();

      return { products: rows.map(productFromDatabase).map(productToProtobuf) };
    },
  };
}

export function registerProductRoutes(
  router: ConnectRouter,
  dependencies: ProductRouteDependencies,
): void {
  router.service(ProductService, createProductService(dependencies));
}
