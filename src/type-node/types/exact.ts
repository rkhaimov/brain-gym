import { TypeNode } from '../../core';
import { fromKindAndPayload } from '../../translate/error';
import { createAtomicTypeNode } from '../createAtomicTypeNode';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    exact: unknown;
  }
}

export const exact = <TType>(exactTo: TType): TypeNode<TType> =>
  createAtomicTypeNode({
      validate: (value) => {
      if (value === exactTo) {
        return [];
      }

      return [fromKindAndPayload('exact', exactTo)];
    },
    defaults: () => exactTo,
  });
