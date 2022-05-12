import { TypeNode } from '../../core';
import { fromKindAndPayload } from '../../translate/error';
import { createAtomicTypeNode } from '../createAtomicTypeNode';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    number: void;
  }
}

export const number = (): TypeNode<number> =>
  createAtomicTypeNode({
      validate: (value) => {
      if (typeof value === 'number') {
        return [];
      }

      return [fromKindAndPayload('number')];
    },
    defaults: () => 0,
  });
