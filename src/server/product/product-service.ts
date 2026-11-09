import { create } from '@bufbuild/protobuf';
import type { Message } from '@bufbuild/protobuf';
import type { ConnectRouter, ServiceImpl } from '@connectrpc/connect';

import { ProductService, ProductSchema } from '../../shared/gen/ceramics/v1/product_pb.js';
import type { Product } from '../../shared/gen/ceramics/v1/product_pb.js';
import type { ApplicationDatabase } from '../database/database.js';
import type { Products } from '../database/generated.js';
import type { EnvService } from '../env.js';
import type { MutationQueue } from '../mutation-queue.js';

const NAME_REQUIRED_MESSAGE = 'Введите название штучки';
const NAME_ALREADY_EXISTS_MESSAGE = 'Штучка с таким названием уже существует';
const PRODUCT_NOT_FOUND_MESSAGE = 'Штучка не найдена';

type ProductId = string & { readonly __productId: true };

export interface ProductRouteDependencies {
  readonly database: ApplicationDatabase;
  readonly env: EnvService;
  readonly mutationQueue: MutationQueue;
}

type DomainProduct = Readonly<
  Omit<Product, keyof Message | 'id'> & {
    id: ProductId;
  }
>;

type PersistedProduct = Pick<Products, 'archived_at_ms' | 'id' | 'name'>;

function productFromDatabase(row: PersistedProduct): DomainProduct {
  return { archived: row.archived_at_ms !== null, id: createProductId(row.id), name: row.name };
}

function productToProtobuf(product: DomainProduct) {
  return create(ProductSchema, {
    archived: product.archived,
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

            const id = createProductId(env.randomUUID());
            const product: DomainProduct = { archived: false, id, name: request.name };
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

    async listProducts(request) {
      const rows = await database.db
        .selectFrom('products')
        .select(['archived_at_ms', 'id', 'name'])
        .where('archived_at_ms', request.archived ? 'is not' : 'is', null)
        .orderBy('created_at_ms', 'asc')
        .orderBy('id', 'asc')
        .execute();

      return { products: rows.map(productFromDatabase).map(productToProtobuf) };
    },

    async renameProduct(request) {
      if (request.name.length === 0) {
        return productFailure(NAME_REQUIRED_MESSAGE);
      }

      return mutationQueue.run(async () => {
        try {
          const row = await database.db
            .updateTable('products')
            .set({ name: request.name })
            .where('id', '=', request.id)
            .returning(['archived_at_ms', 'id', 'name'])
            .executeTakeFirst();
          return row === undefined
            ? productFailure(PRODUCT_NOT_FOUND_MESSAGE)
            : {
                result: {
                  case: 'success' as const,
                  value: productToProtobuf(productFromDatabase(row)),
                },
              };
        } catch (error) {
          if (isUniqueConstraintError(error)) {
            return productFailure(NAME_ALREADY_EXISTS_MESSAGE);
          }
          throw error;
        }
      });
    },

    async setProductArchived(request) {
      return mutationQueue.run(async () => {
        const row = await database.db
          .updateTable('products')
          .set({ archived_at_ms: request.archived ? env.now().getTime() : null })
          .where('id', '=', request.id)
          .returning(['archived_at_ms', 'id', 'name'])
          .executeTakeFirst();
        return row === undefined
          ? productFailure(PRODUCT_NOT_FOUND_MESSAGE)
          : {
              result: {
                case: 'success' as const,
                value: productToProtobuf(productFromDatabase(row)),
              },
            };
      });
    },
  };
}

export function registerProductRoutes(
  router: ConnectRouter,
  dependencies: ProductRouteDependencies,
): void {
  router.service(ProductService, createProductService(dependencies));
}

function createProductId(value: string): ProductId {
  // Product service is the owner of product id construction
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion typescript/consistent-type-assertions
  return value as ProductId;
}
