import { ValidationMessages } from 'validation-messages';
import { InternalValidationError, TypeNode } from './core';

export const translateTo =
  (dictionary: Partial<Dictionary>) =>
  <TTypeNode extends TypeNode>(tn: TTypeNode): TTypeNode => {
    return tn.clone({
      translate: (error) => translate(tn.translate(error), dictionary),
    });
  };

const translate = (
  error: InternalValidationError,
  dictionary: Partial<Dictionary>
): InternalValidationError => {
  const createMessage = dictionary[error.kind] as (arg: unknown) => string;

  if (createMessage) {
    return { ...error, message: createMessage(error.params) };
  }

  return error;
};

type Dictionary = {
  [TKey in keyof ValidationMessages]: (
    params: ValidationMessages[TKey]
  ) => string;
};
