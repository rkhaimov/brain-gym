import {
  InternalValidationError,
  ToType,
  TypeNode,
  TypeNodeOperator,
} from './core';
import { validate as _validate } from './validate';

export const validateConcatMap =
  <TTypeNode extends TypeNode>(
    validate: (
      value: ToType<TTypeNode>,
      tn: TTypeNode
    ) => InternalValidationError[]
  ): TypeNodeOperator<TTypeNode> =>
  (tn) =>
    tn.clone({
      __validate: (value) => {
        const errors = _validate(tn as TypeNode, value);

        if (errors.length === 0) {
          return validate(value as ToType<TTypeNode>, tn);
        }

        return errors;
      },
    });
