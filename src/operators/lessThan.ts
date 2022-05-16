import { Operator } from '../core';
import { defaultsMap } from './defaultsMap';
import { fromKindAndPayload } from '../translate/error';
import { validateConcatMap } from './validateConcatMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    lessThan: number;
  }
}

export const lessThan =
  (than: number): Operator<number> =>
  (tn) =>
    tn.pipe(
      validateConcatMap((value) =>
        value < than ? [] : [fromKindAndPayload('lessThan', than)]
      ),
      defaultsMap(() => than)
    );
