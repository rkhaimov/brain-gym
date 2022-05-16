import { Operator, TypeNode } from '../core';
import { InternalValidationError } from '../translate/error';
import { validateConcatMap } from './validateConcatMap';

export const refineMap =
  <A, B extends A>(
    refine: (value: B, tn: TypeNode<A>) => InternalValidationError[]
  ): Operator<A, B> =>
  (tn) => {
    const _tn = tn as TypeNode<B>;

    return _tn.pipe(validateConcatMap(refine));
  };
