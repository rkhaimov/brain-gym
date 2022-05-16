import { fromKindAndPayload } from '../translate/error';
import { Operator } from '../core';
import { validateConcatMap } from './validateConcatMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    lengthMin: number;
  }
}

export const lengthMin =
  <TType extends { length: number }>(min: number): Operator<TType> =>
  (tn) =>
    tn.pipe(
      validateConcatMap((value) => {
        if (value.length < min) {
          return [fromKindAndPayload('lengthMin', min)];
        }

        return [];
      })
    );
