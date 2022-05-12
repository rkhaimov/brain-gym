import { TypeNode, TypeNodeOperator } from '../../core';
import { defaultsMap} from '../../defaultsMap';
import { fromKindAndPayload } from '../../validate';
import { validateConcatMap } from '../../validateConcatMap';

declare module 'validation-messages' {
  interface ValidationMessages {
    dividableBy: number;
  }
}

export const dividableBy =
  (factor: number): TypeNodeOperator<TypeNode<number>> =>
  (tn) =>
    tn.wrap(
      defaultsMap(() => factor),
      validateConcatMap((value) => {
        if (value % factor === 0) {
          return [];
        }

        return [fromKindAndPayload('dividableBy', factor)];
      })
    );
