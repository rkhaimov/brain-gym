import { TypeNode } from '../../core';
import { fromKindAndPayload } from '../../translate/error';
import { createAtomicTypeNode } from '../createAtomicTypeNode';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    string: void;
  }
}

export const string = (): TypeNode<string> =>
  createAtomicTypeNode({
    validate: (value) => {
      if (typeof value === 'string') {
        return [];
      }

      return [fromKindAndPayload('string')];
    },
    defaults: () => '',
  });
