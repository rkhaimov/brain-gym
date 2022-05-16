import { fromKindAndPayload } from '../translate/error';
import { unknown } from './unknown';
import { refineMap } from '../operators/refineMap';
import { defaultsMap } from '../operators/defaultsMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    boolean: void;
  }
}

export const boolean = () =>
  unknown().pipe(
    refineMap((value: boolean) => {
      if (typeof value === 'boolean') {
        return [];
      }

      return [fromKindAndPayload('boolean')];
    }),
    defaultsMap(() => false)
  );
