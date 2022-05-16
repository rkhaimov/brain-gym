import { Operator, TypeNode } from '../core';
import { InternalValidationError } from '../translate/error';
import { validate } from '../validate';

const validateMergeMap =
  <T>(
    or: (value: T, tn: TypeNode<T>) => InternalValidationError[]
  ): Operator<T> =>
  (tn) => ({
    ...tn,
    validate: (value) => [...validate(tn, value), ...or(value, tn)],
  });
