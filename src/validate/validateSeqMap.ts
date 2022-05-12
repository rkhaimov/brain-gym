import { ToType, TypeNode, TypeNodeOperator } from '../core';
import { InternalValidationError } from '../translate/error';
import { validate as _validate } from './index';

export const validateSeqMap =
  <TTypeNode extends TypeNode>(
    validate: (
      value: ToType<TTypeNode>,
      tn: TTypeNode
    ) => InternalValidationError[]
  ): TypeNodeOperator<TTypeNode> =>
  (tn) =>
    tn.__clone({
      validate: (value) => {
        const errors = _validate(tn as TypeNode, value);

        if (errors.length === 0) {
          return validate(value as ToType<TTypeNode>, tn);
        }

        return errors;
      },
    });
