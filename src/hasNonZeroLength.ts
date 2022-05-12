import { TypeNode, TypeNodeOperator } from './core';
import { fromKindAndPayload } from './translate/error';
import { validateSeqMap } from './validate/validateSeqMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    hasNonZeroLength: void;
  }
}

export const hasNonZeroLength =
  <
    TType extends { length: number },
    TTypeNode extends TypeNode<TType>
  >(): TypeNodeOperator<TTypeNode> =>
  (tn) =>
    tn.wrap(
      validateSeqMap((value) => {
        if (value.length === 0) {
          return [fromKindAndPayload('hasNonZeroLength')];
        }

        return [];
      })
    );
