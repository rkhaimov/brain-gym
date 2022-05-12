import { TypeNode } from '../../core';
import { fromKindAndPayload } from '../../validate';
import { createTypeNode } from '../createTypeNode';

declare module 'validation-messages' {
  interface ValidationMessages {
    number: void;
  }
}

export const number = (): TypeNode<number> =>
  createTypeNode({
    validate: (value) => {
      if (typeof value === 'number') {
        return [];
      }

      return [fromKindAndPayload('number')];
    },
    defaults: () => 0,
  });
