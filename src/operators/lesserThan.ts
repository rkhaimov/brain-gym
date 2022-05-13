import { TypeNode } from '../core';
import { defaultsMap } from './defaultsMap';
import { fromKindAndPayload } from '../translate/error';
import { satisfiesTo } from './satisfiesTo';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    lesserThan: number;
  }
}

export const lesserThan = (than: number) => (tn: TypeNode<number>) =>
  tn.operate(
    satisfiesTo(
      (value) => value < than,
      () => fromKindAndPayload('lesserThan', than)
    ),
    defaultsMap(() => than)
  );
