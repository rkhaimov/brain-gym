import { AsyncLocalStorage } from 'node:async_hooks';
import { Either } from '../../utils/Either';
import { Failure } from '../../utils/Failure';
import { isNil } from '../../utils/utils';

type User = { name: string; email: string };

const context = new AsyncLocalStorage<User>();

export function UserProvider<TR>(user: User, fn: () => TR): TR {
  return context.run(user, fn);
}

export type ContextFailure = Failure<'ContextIsMissing', void>;

export function useUser(): Either<ContextFailure, User> {
  const user = context.getStore();

  if (isNil(user)) {
    return Either.left({ kind: 'ContextIsMissing', body: undefined });
  }

  return Either.right(user);
}
