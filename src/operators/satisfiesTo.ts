import { InferType, TypeNode } from '../core';
import { validateConcatMap } from './validateConcatMap';
import { fromKindAndPayload } from '../translate/error';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    satisfiesTo: void;
  }
}

export const satisfiesTo =
  <TTypeNode extends TypeNode>(
    predicate: (value: InferType<TTypeNode>) => boolean,
    message = () => fromKindAndPayload('satisfiesTo')
  ) =>
  (tn: TTypeNode) =>
    tn.operate(
      validateConcatMap((value) => {
        if (predicate(value)) {
          return [];
        }

        return [message()];
      })
    );
