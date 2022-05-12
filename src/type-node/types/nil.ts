import { TypeNode } from '../../core';
import { fromKindAndPayload } from '../../validate';
import { createTypeNode } from '../createTypeNode';

declare module 'validation-messages' {
  interface ValidationMessages {
    nil: void;
  }
}

export const nil = (): TypeNode<undefined | null> =>
  createTypeNode({
    validate: (value) => {
      if (value === null || value === undefined) {
        return [];
      }

      return [fromKindAndPayload('nil')];
    },
    defaults: () => undefined,
  });
