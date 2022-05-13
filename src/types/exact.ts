import { TypeNode } from '../core';
import { fromKindAndPayload } from '../translate/error';
import { refine } from '../augmentors/refine';
import { unknown } from './unknown';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    exact: Primitives;
  }
}

type Primitives = boolean | string | number;

export const exact = <TType extends Primitives>(
  exactTo: TType
): TypeNode<TType> =>
  refine(unknown(), {
    validate: (value) => {
      if (value === exactTo) {
        return [];
      }

      return [fromKindAndPayload('exact', exactTo)];
    },
    defaults: () => exactTo,
  });
