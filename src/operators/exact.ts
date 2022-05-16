import { Operator } from '../core';
import { refineMap } from './refineMap';
import { defaultsMap } from './defaultsMap';
import { fromKindAndPayload } from '../translate/error';

type Primitive = string | number | boolean;

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    exact: Primitive;
  }
}

export const exact =
  <TType extends Primitive, TExact extends TType>(
    exactTo: TExact
  ): Operator<TType, TExact> =>
  (tn) =>
    tn.pipe(
      refineMap((value: TExact) =>
        value === exactTo ? [] : [fromKindAndPayload('exact', exactTo)]
      ),
      defaultsMap(() => exactTo)
    );
