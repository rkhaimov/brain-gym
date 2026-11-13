import { createClient, createRouterTransport } from '@connectrpc/connect';
import { describe, expect } from 'vitest';

import {
  OutletMutationFailureField,
  OutletService,
} from '../../shared/gen/ceramics/v1/outlet_pb.js';
import { assertSuccess } from '../../test/server/assertions.js';
import { testEnv } from '../../test/server/env.js';
import { test as serverTest } from '../../test/server/test.js';
import type { TestDatabase } from '../../test/server/test.js';
import { MutationQueue } from '../mutation-queue.js';
import { registerOutletRoutes } from './outlet-service.js';

function outletClient(database: TestDatabase) {
  const transport = createRouterTransport((router) => {
    registerOutletRoutes(router, {
      database: database.value,
      env: testEnv,
      mutationQueue: new MutationQueue(),
    });
  });
  return createClient(OutletService, transport);
}

type OutletClient = ReturnType<typeof outletClient>;

interface OutletServiceFixture {
  readonly client: OutletClient;
  restart(): Promise<OutletClient>;
}

interface OutletFixtures {
  readonly outletService: OutletServiceFixture;
}

const test = serverTest.extend<OutletFixtures>({
  outletService: async ({ database }, use) => {
    await use({
      client: outletClient(database),
      async restart() {
        await database.restart();
        return outletClient(database);
      },
    });
  },
});

describe('OutletService', () => {
  test('creator can create and retrieve an Outlet', async ({ outletService }) => {
    const client = outletService.client;

    const created = await client.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(created);
    expect(created.result.value).toMatchObject({
      archived: false,
      name: 'Гончарная лавка',
    });
    const listed = await client.listOutlets({});
    expect(listed.outlets).toMatchObject([{ name: 'Гончарная лавка' }]);
  });

  test('creator can rename an Outlet without changing identity', async ({ outletService }) => {
    const client = outletService.client;
    const created = await client.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(created);
    const outletId = created.result.value.id;

    await expect(
      client.updateOutlet({ id: outletId, name: 'Новая гончарная лавка' }),
    ).resolves.toMatchObject({
      result: {
        case: 'success',
        value: { id: outletId, name: 'Новая гончарная лавка' },
      },
    });
  });

  test('exact names remain reserved across active and archived Outlets', async ({
    outletService,
  }) => {
    const client = outletService.client;
    const reserved = await client.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(reserved);
    await client.setOutletArchived({ archived: true, id: reserved.result.value.id });

    await expect(client.createOutlet({ name: 'Гончарная лавка' })).resolves.toMatchObject({
      result: {
        case: 'failure',
        value: {
          field: OutletMutationFailureField.NAME,
          message: 'Магазин с таким названием уже существует',
        },
      },
    });
    const exactVariants = await Promise.all([
      client.createOutlet({ name: 'гончарная лавка' }),
      client.createOutlet({ name: ' Гончарная лавка ' }),
      client.createOutlet({ name: 'Гончарная лавка!' }),
    ]);
    exactVariants.forEach(assertSuccess);

    const editable = await client.createOutlet({ name: 'Редактируемая точка' });
    assertSuccess(editable);
    await expect(
      client.updateOutlet({
        id: editable.result.value.id,
        name: 'Гончарная лавка',
      }),
    ).resolves.toMatchObject({
      result: {
        case: 'failure',
        value: {
          field: OutletMutationFailureField.NAME,
          message: 'Магазин с таким названием уже существует',
        },
      },
    });
  });

  test('creator can archive and restore an Outlet without changing its identity', async ({
    outletService,
  }) => {
    const client = outletService.client;
    const created = await client.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(created);
    const outletId = created.result.value.id;

    await expect(client.setOutletArchived({ archived: true, id: outletId })).resolves.toMatchObject(
      {
        result: { case: 'success', value: { archived: true, id: outletId } },
      },
    );
    await expect(client.listOutlets({})).resolves.toMatchObject({ outlets: [] });
    await expect(client.listOutlets({ archived: true })).resolves.toMatchObject({
      outlets: [{ archived: true, id: outletId }],
    });

    await expect(
      client.setOutletArchived({ archived: false, id: outletId }),
    ).resolves.toMatchObject({
      result: { case: 'success', value: { archived: false, id: outletId } },
    });
    await expect(client.listOutlets({})).resolves.toMatchObject({
      outlets: [{ archived: false, id: outletId }],
    });
  });

  test('creator receives a Russian failure when an Outlet name is empty', async ({
    outletService,
  }) => {
    const client = outletService.client;

    await expect(client.createOutlet({ name: '' })).resolves.toMatchObject({
      result: {
        case: 'failure',
        value: {
          field: OutletMutationFailureField.NAME,
          message: 'Введите название магазина',
        },
      },
    });
    const created = await client.createOutlet({ name: 'Гончарная лавка' });
    assertSuccess(created);
    await expect(
      client.updateOutlet({ id: created.result.value.id, name: '' }),
    ).resolves.toMatchObject({
      result: {
        case: 'failure',
        value: {
          field: OutletMutationFailureField.NAME,
          message: 'Введите название магазина',
        },
      },
    });
  });

  test('Outlets survive closing and reopening the database', async ({ outletService }) => {
    await outletService.client.createOutlet({ name: 'Гончарная лавка' });

    const restartedClient = await outletService.restart();

    await expect(restartedClient.listOutlets({})).resolves.toMatchObject({
      outlets: [{ name: 'Гончарная лавка' }],
    });
  });
});
