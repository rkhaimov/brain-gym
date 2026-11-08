import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { Code, ConnectError, createClient, createRouterTransport } from '@connectrpc/connect';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import {
  ProductService,
  ProductValidationErrorSchema,
  ProductValidationField,
  ProductValidationReason,
} from '../../shared/gen/ceramics/v1/product_pb.js';
import { createProductId } from '../../shared/product-id.js';
import type { EnvService } from '../env.js';
import { openApplicationDatabase } from '../database/database.js';
import type { ApplicationDatabase } from '../database/database.js';
import { MutationQueue } from '../mutation-queue.js';
import { registerProductRoutes } from './product-service.js';

function environmentWithIds(...ids: string[]): EnvService {
  const remainingIds = [...ids];
  return {
    newProductId() {
      const id = remainingIds.shift();
      if (id === undefined) {
        throw new Error('Test EnvService ran out of Product identifiers');
      }
      return createProductId(id);
    },
    now: () => new Date('2026-11-08T09:00:00.000Z'),
  };
}

describe('ProductService', () => {
  let database: ApplicationDatabase;
  let temporaryDirectory: string;

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'ceramics-ledger-product-'));
    database = await openApplicationDatabase(join(temporaryDirectory, 'test.sqlite'));
  });

  afterEach(async () => {
    await database.close();
    await rm(temporaryDirectory, { force: true, recursive: true });
  });

  function productClient(env: EnvService) {
    const transport = createRouterTransport((router) => {
      registerProductRoutes(router, {
        database,
        env,
        mutationQueue: new MutationQueue(),
      });
    });
    return createClient(ProductService, transport);
  }

  test('creator can create a Product and retrieve it from the catalog', async () => {
    const env: EnvService = {
      newProductId: () => createProductId('product-1'),
      now: () => new Date('2026-11-08T09:00:00.000Z'),
    };
    const client = productClient(env);

    await expect(client.createProduct({ name: 'Кольцо' })).resolves.toMatchObject({
      product: { id: 'product-1', name: 'Кольцо' },
    });
    await expect(client.listProducts({})).resolves.toMatchObject({
      products: [{ id: 'product-1', name: 'Кольцо' }],
    });
    await expect(
      database.db.selectFrom('products').select('created_at_ms').executeTakeFirstOrThrow(),
    ).resolves.toEqual({ created_at_ms: 1_794_128_400_000 });
  });

  test('creator sees a typed name error when a Product name is empty', async () => {
    const client = productClient({
      newProductId: () => createProductId('unused'),
      now: () => new Date('2026-11-08T09:00:00.000Z'),
    });

    try {
      await client.createProduct({ name: '' });
      expect.fail('Expected Product creation to be rejected');
    } catch (error) {
      const connectError = ConnectError.from(error);
      expect(connectError.code).toBe(Code.InvalidArgument);
      expect(connectError.findDetails(ProductValidationErrorSchema)).toEqual([
        expect.objectContaining({
          field: ProductValidationField.NAME,
          reason: ProductValidationReason.NAME_REQUIRED,
        }),
      ]);
    }
  });

  test('creator is blocked from an exact duplicate but can use exact-name variants', async () => {
    const client = productClient(
      environmentWithIds(
        'product-1',
        'product-2',
        'product-3',
        'product-4',
        'product-5',
        'product-6',
        'product-7',
      ),
    );

    await client.createProduct({ name: 'Кольцо' });
    try {
      await client.createProduct({ name: 'Кольцо' });
      expect.fail('Expected the exact duplicate to be rejected');
    } catch (error) {
      const connectError = ConnectError.from(error);
      expect(connectError.code).toBe(Code.AlreadyExists);
      expect(connectError.findDetails(ProductValidationErrorSchema)).toEqual([
        expect.objectContaining({
          field: ProductValidationField.NAME,
          reason: ProductValidationReason.NAME_ALREADY_EXISTS,
        }),
      ]);
    }

    await client.createProduct({ name: 'кольцо' });
    await client.createProduct({ name: ' Кольцо ' });
    await client.createProduct({ name: 'Кольцо!' });
    await client.createProduct({ name: '   ' });
    await client.createProduct({ name: 'é' });
    await client.createProduct({ name: 'e\u0301' });

    await expect(client.listProducts({})).resolves.toMatchObject({
      products: [
        { name: 'Кольцо' },
        { name: 'кольцо' },
        { name: ' Кольцо ' },
        { name: 'Кольцо!' },
        { name: '   ' },
        { name: 'é' },
        { name: 'e\u0301' },
      ],
    });
  });

  test('concurrent exact duplicates commit one Product and reject the other', async () => {
    const client = productClient(environmentWithIds('product-1', 'product-2'));

    const results = await Promise.allSettled([
      client.createProduct({ name: 'Кольцо' }),
      client.createProduct({ name: 'Кольцо' }),
    ]);
    const successfulResults = results.filter((result) => result.status === 'fulfilled');
    const failedResults = results.filter((result) => result.status === 'rejected');

    expect(successfulResults).toHaveLength(1);
    expect(failedResults).toHaveLength(1);
    const failedResult = failedResults[0];
    if (failedResult === undefined) {
      expect.fail('Expected one failed concurrent Product creation');
    }
    const connectError = ConnectError.from(failedResult.reason);
    expect(connectError.code).toBe(Code.AlreadyExists);
    await expect(client.listProducts({})).resolves.toMatchObject({
      products: [{ id: 'product-1', name: 'Кольцо' }],
    });
  });

  test('concurrent Product writes are committed in FIFO order', async () => {
    const client = productClient(environmentWithIds('product-1', 'product-2', 'product-3'));

    await Promise.all([
      client.createProduct({ name: 'Кольцо' }),
      client.createProduct({ name: 'Кулон' }),
      client.createProduct({ name: 'Брошь' }),
    ]);

    await expect(client.listProducts({})).resolves.toMatchObject({
      products: [
        { id: 'product-1', name: 'Кольцо' },
        { id: 'product-2', name: 'Кулон' },
        { id: 'product-3', name: 'Брошь' },
      ],
    });
  });

  test('created Products survive closing and reopening the database', async () => {
    const databasePath = join(temporaryDirectory, 'test.sqlite');
    const client = productClient(environmentWithIds('product-1'));
    await client.createProduct({ name: 'Кольцо' });

    await database.close();
    database = await openApplicationDatabase(databasePath);
    const restartedClient = productClient(environmentWithIds('unused'));

    await expect(restartedClient.listProducts({})).resolves.toMatchObject({
      products: [{ id: 'product-1', name: 'Кольцо' }],
    });
  });
});
