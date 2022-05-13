import { TypeNode } from '../core';
import { fromKindAndPayload } from '../translate/error';
import { refine } from '../augmentors/refine';
import { unknown } from './unknown';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    number: void;
  }
}

export const number = (): TypeNode<number> =>
  refine(unknown(), {
    validate: (value) => {
      if (typeof value === 'number') {
        return [];
      }

      return [fromKindAndPayload('number')];
    },
    defaults: () => 0,
  });
