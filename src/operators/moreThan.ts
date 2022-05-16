import { Operator } from '../core';
import { fromKindAndPayload } from '../translate/error';
import { defaultsMap } from './defaultsMap';
import { validateConcatMap } from './validateConcatMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    moreThan: number;
  }
}

export const moreThan =
  (than: number): Operator<number> =>
  (tn) =>
    tn.pipe(
      validateConcatMap((value) =>
        value > than ? [] : [fromKindAndPayload('moreThan', than)]
      ),
      defaultsMap(() => than + 1)
    );
