import { createClient, createRouterTransport } from '@connectrpc/connect';
import { describe, expect } from 'vitest';

import { ProductService } from '../../shared/gen/ceramics/v1/product_pb.js';
import { assertSuccess } from '../../test/server/assertions.js';
import { testEnv } from '../../test/server/env.js';
import { test as serverTest } from '../../test/server/test.js';
import type { TestDatabase } from '../../test/server/test.js';
import { MutationQueue } from '../mutation-queue.js';
import { registerProductRoutes } from './product-service.js';

function productClient(database: TestDatabase) {
  const transport = createRouterTransport((router) => {
    registerProductRoutes(router, {
      database: database.value,
      env: testEnv,
      mutationQueue: new MutationQueue(),
    });
  });
  return createClient(ProductService, transport);
}

type ProductClient = ReturnType<typeof productClient>;

interface ProductServiceFixture {
  readonly client: ProductClient;
  restart(): Promise<ProductClient>;
}

interface ProductFixtures {
  readonly productService: ProductServiceFixture;
}

const test = serverTest.extend<ProductFixtures>({
  productService: async ({ database }, use) => {
    await use({
      client: productClient(database),
      async restart() {
        await database.restart();
        return productClient(database);
      },
    });
  },
});

describe('ProductService', () => {
  test('creator can create a Product and retrieve it from the catalog', async ({
    productService,
  }) => {
    const client = productService.client;

    await expect(client.createProduct({ name: 'Кольцо' })).resolves.toMatchObject({
      result: {
        case: 'success',
        value: { name: 'Кольцо' },
      },
    });
    await expect(client.listProducts({})).resolves.toMatchObject({
      products: [{ name: 'Кольцо' }],
    });
  });

  test('creator can rename, archive, and restore a Product without changing its identity', async ({
    productService,
  }) => {
    const client = productService.client;
    const created = await client.createProduct({ name: 'Кольцо' });
    assertSuccess(created);
    const productId = created.result.value.id;

    await expect(
      client.renameProduct({ id: productId, name: 'Кольцо с гранатом' }),
    ).resolves.toMatchObject({
      result: {
        case: 'success',
        value: { id: productId, name: 'Кольцо с гранатом', archived: false },
      },
    });
    await expect(
      client.setProductArchived({ id: productId, archived: true }),
    ).resolves.toMatchObject({
      result: {
        case: 'success',
        value: { id: productId, archived: true },
      },
    });
    await expect(client.listProducts({})).resolves.toMatchObject({ products: [] });
    await expect(client.listProducts({ archived: true })).resolves.toMatchObject({
      products: [{ id: productId, archived: true }],
    });

    await expect(
      client.setProductArchived({ id: productId, archived: false }),
    ).resolves.toMatchObject({
      result: {
        case: 'success',
        value: { id: productId, archived: false },
      },
    });
    await expect(client.listProducts({})).resolves.toMatchObject({
      products: [{ id: productId, archived: false }],
    });
  });

  test('archived Product names remain reserved with exact equality for create and rename', async ({
    productService,
  }) => {
    const client = productService.client;
    const archived = await client.createProduct({ name: 'Кольцо' });
    assertSuccess(archived);
    await client.setProductArchived({ id: archived.result.value.id, archived: true });

    await expect(client.createProduct({ name: 'Кольцо' })).resolves.toMatchObject({
      result: { case: 'failure', value: 'Штучка с таким названием уже существует' },
    });
    const active = await client.createProduct({ name: 'Кулон' });
    assertSuccess(active);
    await expect(
      client.renameProduct({ id: active.result.value.id, name: 'Кольцо' }),
    ).resolves.toMatchObject({
      result: { case: 'failure', value: 'Штучка с таким названием уже существует' },
    });
    await expect(
      client.renameProduct({ id: active.result.value.id, name: 'кольцо' }),
    ).resolves.toMatchObject({
      result: { case: 'success', value: { id: active.result.value.id, name: 'кольцо' } },
    });
  });

  test('creator receives a Russian failure when a Product name is empty', async ({
    productService,
  }) => {
    const client = productService.client;

    await expect(client.createProduct({ name: '' })).resolves.toMatchObject({
      result: { case: 'failure', value: 'Введите название штучки' },
    });
  });

  test('creator is blocked from an exact duplicate but can use exact-name variants', async ({
    productService,
  }) => {
    const client = productService.client;

    await client.createProduct({ name: 'Кольцо' });
    await expect(client.createProduct({ name: 'Кольцо' })).resolves.toMatchObject({
      result: {
        case: 'failure',
        value: 'Штучка с таким названием уже существует',
      },
    });

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

  test('concurrent exact duplicates commit one Product and return one failure', async ({
    productService,
  }) => {
    const client = productService.client;

    const results = await Promise.all([
      client.createProduct({ name: 'Кольцо' }),
      client.createProduct({ name: 'Кольцо' }),
    ]);
    const successfulResults = results.filter((result) => result.result.case === 'success');
    const failedResults = results.filter((result) => result.result.case === 'failure');

    expect(successfulResults).toHaveLength(1);
    expect(failedResults).toHaveLength(1);
    expect(failedResults[0]).toMatchObject({
      result: {
        case: 'failure',
        value: 'Штучка с таким названием уже существует',
      },
    });
    await expect(client.listProducts({})).resolves.toMatchObject({
      products: [{ name: 'Кольцо' }],
    });
  });

  test('concurrent Product writes are committed in FIFO order', async ({ productService }) => {
    const client = productService.client;

    await Promise.all([
      client.createProduct({ name: 'Кольцо' }),
      client.createProduct({ name: 'Кулон' }),
      client.createProduct({ name: 'Брошь' }),
    ]);

    await expect(client.listProducts({})).resolves.toMatchObject({
      products: [{ name: 'Кольцо' }, { name: 'Кулон' }, { name: 'Брошь' }],
    });
  });

  test('created Products survive closing and reopening the database', async ({
    productService,
  }) => {
    const client = productService.client;
    await client.createProduct({ name: 'Кольцо' });

    const restartedClient = await productService.restart();

    await expect(restartedClient.listProducts({})).resolves.toMatchObject({
      products: [{ name: 'Кольцо' }],
    });
  });
});
