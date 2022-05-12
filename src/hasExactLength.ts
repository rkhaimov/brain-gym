import { TypeNode, TypeNodeOperator } from './core';
import { fromErrorMessage, fromKindAndPayload } from './validate';
import { validateConcatMap } from './validateConcatMap';

declare module 'validation-messages' {
  interface ValidationMessages {
    hasExactLength: number;
  }
}

export const hasExactLength =
  <TType extends { length: number }, TTypeNode extends TypeNode<TType>>(
    length: number
  ): TypeNodeOperator<TTypeNode> =>
  (tn) =>
    tn.wrap(
      validateConcatMap((value) => {
        if (value.length === length) {
          return [];
        }

        return [fromKindAndPayload('hasExactLength', length)];
      })
    );
