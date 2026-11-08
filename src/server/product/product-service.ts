import { create } from '@bufbuild/protobuf';
import { Code, ConnectError } from '@connectrpc/connect';
import type { ConnectRouter, ServiceImpl } from '@connectrpc/connect';

import {
  ProductService,
  ProductSchema,
  ProductValidationErrorSchema,
  ProductValidationField,
  ProductValidationReason,
} from '../../shared/gen/ceramics/v1/product_pb.js';
import { createProductId, productIdToString } from '../../shared/product-id.js';
import type { ProductId } from '../../shared/product-id.js';
import type { ApplicationDatabase } from '../database/database.js';
import type { EnvService } from '../env.js';
import type { MutationQueue } from '../mutation-queue.js';

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
  return { id: createProductId(row.id), name: row.name };
}

function productToProtobuf(product: DomainProduct) {
  return create(ProductSchema, {
    id: productIdToString(product.id),
    name: product.name,
  });
}

function validationError(reason: ProductValidationReason, code: Code): ConnectError {
  return new ConnectError('Product validation failed', code, undefined, [
    {
      desc: ProductValidationErrorSchema,
      value: create(ProductValidationErrorSchema, {
        field: ProductValidationField.NAME,
        reason,
      }),
    },
  ]);
}

function nameRequiredError(): ConnectError {
  return validationError(ProductValidationReason.NAME_REQUIRED, Code.InvalidArgument);
}

function nameAlreadyExistsError(): ConnectError {
  return validationError(ProductValidationReason.NAME_ALREADY_EXISTS, Code.AlreadyExists);
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
        throw nameRequiredError();
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
              throw nameAlreadyExistsError();
            }

            const product: DomainProduct = { id: env.newProductId(), name: request.name };
            await transaction
              .insertInto('products')
              .values({
                created_at_ms: env.now().getTime(),
                id: productIdToString(product.id),
                name: product.name,
              })
              .executeTakeFirstOrThrow();

            return { product: productToProtobuf(product) };
          });
        } catch (error) {
          if (error instanceof ConnectError) {
            throw error;
          }
          if (isUniqueConstraintError(error)) {
            throw nameAlreadyExistsError();
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
