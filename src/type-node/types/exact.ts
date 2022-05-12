import { TypeNode } from '../../core';
import { fromKindAndPayload } from '../../validate';
import { createTypeNode } from '../createTypeNode';

declare module 'validation-messages' {
  interface ValidationMessages {
    exact: string;
  }
}

export const exact = <TType extends string>(exactTo: TType): TypeNode<TType> =>
  createTypeNode({
    validate: (value) => {
      if (value === exactTo) {
        return [];
      }

      return [fromKindAndPayload('exact', exactTo)];
    },
    defaults: () => exactTo,
  });
