import { Operator, TypeNode } from '../core';
import { InternalValidationError } from '../translate/error';
import { validate } from '../validate';

export const validateConcatMap =
  <T>(
    and: (value: T, tn: TypeNode<T>) => InternalValidationError[]
  ): Operator<T> =>
  (tn) => ({
    ...tn,
    validate: (value) => {
      const errors = validate(tn, value);

      if (errors.length === 0) {
        return and(value, tn);
      }

      return errors;
    },
  });
