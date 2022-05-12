import { TypeNode, TypeNodeOperator } from '../../core';
import { defaultsMap} from '../../defaults/defaultsMap';
import { fromKindAndPayload } from '../../translate/error';
import { validateSeqMap } from '../../validate/validateSeqMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    dividableBy: number;
  }
}

export const dividableBy =
  (factor: number): TypeNodeOperator<TypeNode<number>> =>
  (tn) =>
    tn.wrap(
      defaultsMap(() => factor),
      validateSeqMap((value) => {
        if (value % factor === 0) {
          return [];
        }

        return [fromKindAndPayload('dividableBy', factor)];
      })
    );
