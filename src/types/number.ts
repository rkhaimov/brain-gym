import { fromKindAndPayload } from '../translate/error';
import { unknown } from './unknown';
import { refineMap } from '../operators/refineMap';
import { defaultsMap } from '../operators/defaultsMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    number: void;
  }
}

export const number = () =>
  unknown().pipe(
    refineMap((value: number) => {
      if (typeof value === 'number') {
        return [];
      }

      return [fromKindAndPayload('number')];
    }),
    defaultsMap(() => 0)
  );
