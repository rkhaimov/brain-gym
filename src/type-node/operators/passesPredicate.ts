import { ToType, TypeNode, TypeNodeOperator } from '../../core';
import { defaultsMap } from '../../defaults/defaultsMap';
import { fromErrorMessage, fromKindAndPayload } from '../../translate/error';
import { validateSeqMap } from '../../validate/validateSeqMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    passesPredicate: void;
  }
}

export const passesPredicate =
  <TTypeNode extends TypeNode>(
    predicate: (value: ToType<TTypeNode>) => boolean
  ): TypeNodeOperator<TTypeNode> =>
  (tn) =>
    tn.wrap(
      validateSeqMap((value) => {
        if (predicate(value)) {
          return [];
        }

        return [fromKindAndPayload('passesPredicate')];
      })
    );
