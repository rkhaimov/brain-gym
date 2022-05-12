import { TypeNode } from '../../core';
import { fromKindAndPayload } from '../../translate/error';
import { createAtomicTypeNode } from '../createAtomicTypeNode';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    oneOf: string[];
  }
}

export const oneOf = <TType extends string>(
  ...types: TType[]
): TypeNode<TType> =>
  createAtomicTypeNode({
    validate: (value) => {
      if (types.includes(value)) {
        return [];
      }

      return [fromKindAndPayload('oneOf', types)];
    },
    defaults: () => types[0],
  });

