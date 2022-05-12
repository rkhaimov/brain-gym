import { TypeNode } from '../../core';
import { fromKindAndPayload } from '../../validate';
import { createTypeNode } from '../createTypeNode';

declare module 'validation-messages' {
  interface ValidationMessages {
    string: void;
  }
}

export const string = (): TypeNode<string> =>
  createTypeNode({
    validate: (value) => {
      if (typeof value === 'string') {
        return [];
      }

      return [fromKindAndPayload('string')];
    },
    defaults: () => '',
  });
