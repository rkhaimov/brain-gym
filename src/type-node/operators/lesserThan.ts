import { TypeNode, TypeNodeOperator } from '../../core';
import { defaultsMap } from '../../defaults/defaultsMap';
import { fromKindAndPayload } from '../../translate/error';
import { validateSeqMap } from '../../validate/validateSeqMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    lesserThan: number;
  }
}

export const lesserThan =
  (than: number): TypeNodeOperator<TypeNode<number>> =>
  (tn) =>
    tn.wrap(
      defaultsMap(() => than),
      validateSeqMap((value) => {
        if (value < than) {
          return [];
        }

        return [fromKindAndPayload('lesserThan', than)];
      })
    );
