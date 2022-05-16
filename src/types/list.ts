import { TypeNode } from '../core';
import { fromKindAndPayload, prependErrorPathWith } from '../translate/error';
import { validate } from '../validate';
import { unknown } from './unknown';
import { refineMap } from '../operators/refineMap';
import { defaultsMap } from '../operators/defaultsMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    list: void;
  }
}

export const list = <TType>(children: TypeNode<TType>) => {
  const tn = unknown().pipe(
    refineMap((value: TType[]) => {
      if (Array.isArray(value)) {
        return value.flatMap((element, index) =>
          validate(children, element).map(prependErrorPathWith(index))
        );
      }

      return [fromKindAndPayload('list')];
    }),
    defaultsMap(() => [])
  );

  return {
    ...tn,
    children: () => children,
  };
};
