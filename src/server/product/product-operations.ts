import { create } from '@bufbuild/protobuf';
import type { Transaction } from 'kysely';

import { ProductSchema } from '../../shared/gen/ceramics/v1/product_pb.js';
import type { DB, Products } from '../database/generated.js';
import type { EnvService } from '../env.js';

export const PRODUCT_NAME_REQUIRED_MESSAGE = 'Введите название штучки';
export const PRODUCT_NAME_ALREADY_EXISTS_MESSAGE = 'Штучка с таким названием уже существует';

export type ProductRecord = Readonly<Pick<Products, 'archived_at_ms' | 'id' | 'name'>>;

export interface ResolvedProductFields {
  readonly product_archived_at_ms: number | null;
  readonly product_id: string | null;
  readonly product_name: string | null;
}

export function resolvedProductToProtobuf(fields: ResolvedProductFields) {
  return fields.product_id === null || fields.product_name === null
    ? undefined
    : create(ProductSchema, {
        archived: fields.product_archived_at_ms !== null,
        id: fields.product_id,
        name: fields.product_name,
      });
}

export type CreateProductRecordResult =
  | Readonly<{ case: 'success'; product: ProductRecord }>
  | Readonly<{ case: 'failure'; message: string }>;

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'SQLITE_CONSTRAINT_UNIQUE';
}

export async function createProductRecord(
  transaction: Transaction<DB>,
  env: EnvService,
  name: string,
): Promise<CreateProductRecordResult> {
  if (name.length === 0) {
    return { case: 'failure', message: PRODUCT_NAME_REQUIRED_MESSAGE };
  }

  try {
    const existing = await transaction
      .selectFrom('products')
      .select('id')
      .where('name', '=', name)
      .executeTakeFirst();
    if (existing !== undefined) {
      return { case: 'failure', message: PRODUCT_NAME_ALREADY_EXISTS_MESSAGE };
    }

    const product: ProductRecord = { archived_at_ms: null, id: env.randomUUID(), name };
    await transaction
      .insertInto('products')
      .values({ created_at_ms: env.now().getTime(), id: product.id, name: product.name })
      .executeTakeFirstOrThrow();
    return { case: 'success', product };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { case: 'failure', message: PRODUCT_NAME_ALREADY_EXISTS_MESSAGE };
    }
    throw error;
  }
}
