import { TypeNode, TypeNodeOperator } from '../../core';
import { defaultsMap} from '../../defaults/defaultsMap';
import { fromKindAndPayload } from '../../translate/error';
import { validateSeqMap } from '../../validate/validateSeqMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    biggerOrEqThan: number;
  }
}

export const biggerOrEqThan =
  (than: number): TypeNodeOperator<TypeNode<number>> =>
  (tn) =>
    tn.wrap(
      defaultsMap(() => than),
      validateSeqMap((value) => {
        if (value >= than) {
          return [];
        }

        return [fromKindAndPayload('biggerOrEqThan', than)];
      })
    );
