import { InferType, TypeNode } from '../core';
import { InternalValidationError } from '../translate/error';
import { validate } from '../validate';

export const validateConcatMap =
  <TTypeNode extends TypeNode>(
    also: (
      value: InferType<TTypeNode>,
      tn: TTypeNode
    ) => InternalValidationError[]
  ) =>
  (tn: TTypeNode): TTypeNode => ({
    ...tn,
    validate: (value, ctn) => {
      const errors = validate(tn, value);

      if (errors.length === 0) {
        return also(value as InferType<TTypeNode>, ctn);
      }

      return errors;
    },
  });
