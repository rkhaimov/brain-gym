import { TypeNode } from '../core';
import { fromKindAndPayload } from '../translate/error';
import { refine } from '../augmentors/refine';
import { unknown } from './unknown';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    string: void;
  }
}

export const string = (): TypeNode<string> =>
  refine(unknown(), {
    validate: (value) => {
      if (typeof value === 'string') {
        return [];
      }

      return [fromKindAndPayload('string')];
    },
    defaults: () => '',
  });
