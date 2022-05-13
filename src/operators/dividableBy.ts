import { TypeNode } from '../core';
import { defaultsMap } from './defaultsMap';
import { fromKindAndPayload } from '../translate/error';
import { satisfiesTo } from './satisfiesTo';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    dividableBy: number;
  }
}

export const dividableBy = (factor: number) => (tn: TypeNode<number>) =>
  tn.operate(
    satisfiesTo(
      (value) => value % factor === 0,
      () => fromKindAndPayload('dividableBy', factor)
    ),
    defaultsMap(() => factor)
  );
