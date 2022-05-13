import { TypeNode } from '../core';
import { fromKindAndPayload } from '../translate/error';
import { refine } from '../augmentors/refine';
import { string } from './string';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    oneOf: string[];
  }
}

export const oneOf = <TType extends string>(
  ...types: TType[]
): TypeNode<TType> =>
  refine(string(), {
    validate: (value) => {
      if (types.includes(value as TType)) {
        return [];
      }

      return [fromKindAndPayload('oneOf', types)];
    },
    defaults: () => types[0],
  });
