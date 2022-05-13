import { TypeNode } from '../core';
import { defaultsMap } from './defaultsMap';
import { fromKindAndPayload } from '../translate/error';
import { satisfiesTo } from './satisfiesTo';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    greaterThan: number;
  }
}

export const greaterThan = (than: number) => (tn: TypeNode<number>) =>
  tn.operate(
    satisfiesTo(
      (value) => value > than,
      () => fromKindAndPayload('greaterThan', than)
    ),
    defaultsMap(() => than + 1)
  );
