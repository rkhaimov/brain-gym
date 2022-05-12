import { TypeNode } from '../../core';
import { fromErrorMessage, fromKindAndPayload } from '../../translate/error';
import { createAtomicTypeNode } from '../createAtomicTypeNode';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    boolean: void;
  }
}

export const boolean = (): TypeNode<boolean> =>
  createAtomicTypeNode({
    validate: (value) => {
      if (typeof value === 'boolean') {
        return [];
      }

      return [fromKindAndPayload('boolean')];
    },
    defaults: () => false,
  });
