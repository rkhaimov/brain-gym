import { TypeNode, TypeNodeOperator } from './core';
import { fromKindAndPayload } from './validate';
import { validateConcatMap } from './validateConcatMap';

declare module 'validation-messages' {
  interface ValidationMessages {
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
      validateConcatMap((value) => {
        if (value.length === 0) {
          return [fromKindAndPayload('hasNonZeroLength')];
        }

        return [];
      })
    );
