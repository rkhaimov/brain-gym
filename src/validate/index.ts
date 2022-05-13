import { TypeNode } from '../core';
import { toReadableErrors } from '../translate/error';
import { translate } from '../translate';

export const narrow = <TType>(tn: TypeNode<TType>, value: unknown): TType => {
  const errors = validate(tn, value as TType);

  if (errors.length === 0) {
    return value as TType;
  }

  throw new Error(toReadableErrors(errors));
};

export const validate = <TType>(tn: TypeNode<TType>, value: TType) =>
  tn.validate(value, tn).map((error) => translate(error, tn.dictionary()));
