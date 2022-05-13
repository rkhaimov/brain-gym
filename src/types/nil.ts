import { TypeNode } from '../core';
import { fromKindAndPayload } from '../translate/error';
import { refine } from '../augmentors/refine';
import { unknown } from './unknown';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    nil: void;
  }
}

export type Nillable<TType = never> = TType | undefined | null;

export const nil = (): TypeNode<Nillable> =>
  refine(unknown(), {
    validate: (value) => {
      if (value === null || value === undefined) {
        return [];
      }

      return [fromKindAndPayload('nil')];
    },
    defaults: () => undefined,
  });
