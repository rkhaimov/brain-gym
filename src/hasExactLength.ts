import { TypeNode, TypeNodeOperator } from './core';
import { fromKindAndPayload } from './translate/error';
import { validateSeqMap } from './validate/validateSeqMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    hasExactLength: number;
  }
}

export const hasExactLength =
  <TType extends { length: number }, TTypeNode extends TypeNode<TType>>(
    length: number
  ): TypeNodeOperator<TTypeNode> =>
  (tn) =>
    tn.wrap(
      validateSeqMap((value) => {
        if (value.length === length) {
          return [];
        }

        return [fromKindAndPayload('hasExactLength', length)];
      })
    );
