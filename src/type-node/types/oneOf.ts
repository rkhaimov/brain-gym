import { TypeNode } from '../../core';
import { fromKindAndPayload } from '../../validate';
import { createTypeNode } from '../createTypeNode';

declare module 'validation-messages' {
  interface ValidationMessages {
    oneOf: string[];
  }
}

export const oneOf = <TType extends string>(
  ...types: TType[]
): TypeNode<TType> =>
  createTypeNode({
    validate: (value) => {
      if (types.includes(value)) {
        return [];
      }

      return [fromKindAndPayload('oneOf', types)];
    },
    defaults: () => types[0],
  });

