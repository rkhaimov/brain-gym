import { TypeNode } from '../core';
import { unknown } from './unknown';
import { refineMap } from '../operators/refineMap';
import { fromKindAndPayload } from '../translate/error';
import { defaultsMap } from '../operators/defaultsMap';
import { defaults } from '../defaults';
import { narrow, validate } from '../validate';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    func: void;
  }
}

export function func<TArg, TReturn>(
  args: [TypeNode<TArg>],
  rtn: TypeNode<TReturn>
) {
  const tn = unknown().pipe(
    refineMap((value: (arg: TArg) => TReturn) => {
      if (typeof value !== 'function') {
        return [fromKindAndPayload('func')];
      }

      const actual = value(defaults(args[0]));

      return validate(rtn, actual);
    }),
    defaultsMap(() => () => rtn.defaults())
  );

  return {
    ...tn,
    wrap:
      (fn: (arg: TArg) => TReturn): ((arg: TArg) => TReturn) =>
      (arg) =>
        narrow(rtn, fn(narrow(args[0], arg))),
  };
}
