import { fromKindAndPayload } from '../translate/error';
import { unknown } from './unknown';
import { refineMap } from '../operators/refineMap';
import { defaultsMap } from '../operators/defaultsMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    string: void;
  }
}

export const string = () =>
  unknown().pipe(
    refineMap((value: string) => {
      if (typeof value === 'string') {
        return [];
      }

      return [fromKindAndPayload('string')];
    }),
    defaultsMap(() => '')
  );
