import { TypeNode } from '../core';
import { fromKindAndPayload } from '../translate/error';
import { satisfiesTo } from './satisfiesTo';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    notEmpty: void;
  }
}

export const notEmpty =
  <TTypeNode extends TypeNode<{ length: number }>>() =>
  (tn: TTypeNode) =>
    tn.operate(
      satisfiesTo(
        (value) => value.length !== 0,
        () => fromKindAndPayload('notEmpty')
      )
    );
