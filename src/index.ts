import { ToType, TypeNode, ValidationError } from './core';
import { toReadableErrors, toValidationError } from './errors';

export const validate = <TNode extends TypeNode>(
  tn: TNode,
  value: ToType<TNode>
): ValidationError[] => {
  return tn.validate(value).map(toValidationError);
};

export const narrow = <TNode extends TypeNode>(
  tn: TNode,
  value: unknown
): ToType<TNode> => {
  const errors = tn.validate(value as ToType<TNode>);

  if (errors.length === 0) {
    return value as ToType<TNode>;
  }

  throw new Error(toReadableErrors(errors));
};
