import { TypeNode, TypeNodeOperator } from '../../core';
import { defaultsMap} from '../../defaultsMap';
import { fromKindAndPayload } from '../../validate';
import { validateConcatMap } from '../../validateConcatMap';

declare module 'validation-messages' {
  interface ValidationMessages {
    lesserOrEqThan: number;
  }
}

export const lesserOrEqThan =
  (than: number): TypeNodeOperator<TypeNode<number>> =>
  (tn) =>
    tn.wrap(
      defaultsMap(() => than),
      validateConcatMap((value) => {
        if (value <= than) {
          return [];
        }

        return [fromKindAndPayload('lesserOrEqThan', than)];
      })
    );
