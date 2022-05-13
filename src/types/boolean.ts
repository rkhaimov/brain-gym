import { TypeNode } from '../core';
import { fromKindAndPayload } from '../translate/error';
import { refine } from '../augmentors/refine';
import { unknown } from './unknown';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    boolean: void;
  }
}

export const boolean = (): TypeNode<boolean> =>
  refine(unknown(), {
    validate: (value) => {
      if (typeof value === 'boolean') {
        return [];
      }

      return [fromKindAndPayload('boolean')];
    },
    defaults: () => false,
  });
