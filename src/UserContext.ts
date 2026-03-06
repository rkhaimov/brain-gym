import { AsyncLocalStorage } from 'node:async_hooks';
import { Either } from './misc/Either';
import { Failure } from './misc/failure';
import { isNil } from './misc/utils';

type User = { user: { id: number; name: string } };

const context = new AsyncLocalStorage<User>();

export function UserProvider<TR>(fn: () => TR): TR {
  return context.run({ user: { id: 0, name: 'John Doe' } }, fn);
}

export function useUser(): Either<Failure<'ContextIsMissing', void>, User> {
  const user = context.getStore();

  if (isNil(user)) {
    return Either.left({ kind: 'ContextIsMissing', body: undefined });
  }

  return Either.right(user);
}
