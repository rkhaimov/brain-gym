import { TypeNode } from '../../core';
import { fromKindAndPayload } from '../../translate/error';
import { createAtomicTypeNode } from '../createAtomicTypeNode';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    nil: void;
  }
}

export const nil = (): TypeNode<undefined | null> =>
  createAtomicTypeNode({
    validate: (value) => {
      if (value === null || value === undefined) {
        return [];
      }

      return [fromKindAndPayload('nil')];
    },
    defaults: () => undefined,
  });
