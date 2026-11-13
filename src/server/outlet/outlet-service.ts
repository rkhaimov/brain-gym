import { create } from '@bufbuild/protobuf';
import type { Message } from '@bufbuild/protobuf';
import type { ConnectRouter, ServiceImpl } from '@connectrpc/connect';
import type { Transaction } from 'kysely';

import {
  OutletMutationFailureField,
  OutletMutationFailureSchema,
  OutletSchema,
  OutletService,
} from '../../shared/gen/ceramics/v1/outlet_pb.js';
import type { Outlet } from '../../shared/gen/ceramics/v1/outlet_pb.js';
import type { ApplicationDatabase } from '../database/database.js';
import type { DB, Outlets } from '../database/generated.js';
import type { EnvService } from '../env.js';
import type { MutationQueue } from '../mutation-queue.js';

const NAME_REQUIRED_MESSAGE = 'Введите название магазина';
const NAME_ALREADY_EXISTS_MESSAGE = 'Магазин с таким названием уже существует';
const OUTLET_NOT_FOUND_MESSAGE = 'Магазин не найден';

type OutletId = string & { readonly __outletId: true };

export interface OutletRouteDependencies {
  readonly database: ApplicationDatabase;
  readonly env: EnvService;
  readonly mutationQueue: MutationQueue;
}

type DomainOutlet = Readonly<
  Omit<Outlet, keyof Message | 'id'> & {
    id: OutletId;
  }
>;

type PersistedOutlet = Pick<Outlets, 'archived_at_ms' | 'id' | 'name'>;

function outletFromDatabase(row: PersistedOutlet): DomainOutlet {
  return {
    archived: row.archived_at_ms !== null,
    id: createOutletId(row.id),
    name: row.name,
  };
}

function outletToProtobuf(outlet: DomainOutlet) {
  return create(OutletSchema, {
    archived: outlet.archived,
    id: outlet.id,
    name: outlet.name,
  });
}

function outletFailure(field: OutletMutationFailureField, message: string) {
  return {
    result: {
      case: 'failure' as const,
      value: create(OutletMutationFailureSchema, { field, message }),
    },
  };
}

function uniqueConstraintFailure(error: unknown) {
  if (!(error instanceof Error) || !('code' in error)) return undefined;
  if (error.code !== 'SQLITE_CONSTRAINT_UNIQUE') return undefined;
  return outletFailure(OutletMutationFailureField.NAME, NAME_ALREADY_EXISTS_MESSAGE);
}

async function outletConflict(
  transaction: Transaction<DB>,
  candidate: Readonly<{
    excludedId?: string | undefined;
    name: string;
  }>,
) {
  let nameQuery = transaction.selectFrom('outlets').select('id').where('name', '=', candidate.name);
  if (candidate.excludedId !== undefined) {
    nameQuery = nameQuery.where('id', '!=', candidate.excludedId);
  }
  if ((await nameQuery.executeTakeFirst()) !== undefined) {
    return outletFailure(OutletMutationFailureField.NAME, NAME_ALREADY_EXISTS_MESSAGE);
  }

  return undefined;
}

function createOutletService(
  dependencies: OutletRouteDependencies,
): ServiceImpl<typeof OutletService> {
  const { database, env, mutationQueue } = dependencies;

  return {
    async createOutlet(request) {
      if (request.name.length === 0) {
        return outletFailure(OutletMutationFailureField.NAME, NAME_REQUIRED_MESSAGE);
      }
      return mutationQueue.run(async () => {
        try {
          return await database.db.transaction().execute(async (transaction) => {
            const conflict = await outletConflict(transaction, { name: request.name });
            if (conflict !== undefined) return conflict;

            const id = createOutletId(env.randomUUID());
            await transaction
              .insertInto('outlets')
              .values({
                created_at_ms: env.now().getTime(),
                id,
                name: request.name,
              })
              .executeTakeFirstOrThrow();
            const outlet: DomainOutlet = {
              archived: false,
              id,
              name: request.name,
            };
            return { result: { case: 'success' as const, value: outletToProtobuf(outlet) } };
          });
        } catch (error) {
          const failure = uniqueConstraintFailure(error);
          if (failure !== undefined) return failure;
          throw error;
        }
      });
    },

    async listOutlets(request) {
      const rows = await database.db
        .selectFrom('outlets')
        .select(['archived_at_ms', 'id', 'name'])
        .where('archived_at_ms', request.archived ? 'is not' : 'is', null)
        .orderBy('created_at_ms', 'asc')
        .orderBy('id', 'asc')
        .execute();

      return { outlets: rows.map(outletFromDatabase).map(outletToProtobuf) };
    },

    async updateOutlet(request) {
      if (request.name.length === 0) {
        return outletFailure(OutletMutationFailureField.NAME, NAME_REQUIRED_MESSAGE);
      }
      return mutationQueue.run(async () => {
        try {
          return await database.db.transaction().execute(async (transaction) => {
            const conflict = await outletConflict(transaction, {
              excludedId: request.id,
              name: request.name,
            });
            if (conflict !== undefined) return conflict;

            const row = await transaction
              .updateTable('outlets')
              .set({ name: request.name })
              .where('id', '=', request.id)
              .returning(['archived_at_ms', 'id', 'name'])
              .executeTakeFirst();
            return row === undefined
              ? outletFailure(OutletMutationFailureField.UNSPECIFIED, OUTLET_NOT_FOUND_MESSAGE)
              : {
                  result: {
                    case: 'success' as const,
                    value: outletToProtobuf(outletFromDatabase(row)),
                  },
                };
          });
        } catch (error) {
          const failure = uniqueConstraintFailure(error);
          if (failure !== undefined) return failure;
          throw error;
        }
      });
    },

    async setOutletArchived(request) {
      return mutationQueue.run(async () =>
        database.db.transaction().execute(async (transaction) => {
          const row = await transaction
            .updateTable('outlets')
            .set({ archived_at_ms: request.archived ? env.now().getTime() : null })
            .where('id', '=', request.id)
            .returning(['archived_at_ms', 'id', 'name'])
            .executeTakeFirst();
          return row === undefined
            ? outletFailure(OutletMutationFailureField.UNSPECIFIED, OUTLET_NOT_FOUND_MESSAGE)
            : {
                result: {
                  case: 'success' as const,
                  value: outletToProtobuf(outletFromDatabase(row)),
                },
              };
        }),
      );
    },
  };
}

export function registerOutletRoutes(
  router: ConnectRouter,
  dependencies: OutletRouteDependencies,
): void {
  router.service(OutletService, createOutletService(dependencies));
}

function createOutletId(value: string): OutletId {
  // Outlet service is the owner of Outlet id construction
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion typescript/consistent-type-assertions
  return value as OutletId;
}
