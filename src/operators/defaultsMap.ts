import { Operator } from '../core';

import { TypeNode } from '../core';

export const defaultsMap =
  <TType, TReturn extends TType>(
    transform: (defaults: TType, tn: TypeNode<TType>) => TReturn
  ): Operator<TType> =>
  (tn) => ({
    ...tn,
    defaults: () => transform(tn.defaults(), tn),
  });
