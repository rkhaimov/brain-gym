import { Dictionary } from './dictionary';
import { InternalValidationError, isTranslated } from './error';

export const translate = (
  error: InternalValidationError,
  dictionary: Dictionary
): InternalValidationError => {
  if (isTranslated(error)) {
    return error;
  }

  const fromDictionary = dictionary[error.kind];

  if (fromDictionary) {
    return {
      ...error,
      message: fromDictionary(error.params as never),
    };
  }

  return error;
};
