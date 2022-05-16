import { fromKindAndPayload } from '../translate/error';
import { unknown } from './unknown';
import { refineMap } from '../operators/refineMap';
import { defaultsMap } from '../operators/defaultsMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    nil: void;
  }
}

export type Nillable<TType = never> = TType | undefined | null;

export const nil = () =>
  unknown().pipe(
    refineMap((value: Nillable) => {
      if (value === null || value === undefined) {
        return [];
      }

      return [fromKindAndPayload('nil')];
    }),
    defaultsMap(() => undefined)
  );
