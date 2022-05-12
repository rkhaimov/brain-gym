import { Dictionary } from './dictionary';
import { InternalValidationError, isTranslated } from './error';

export const translate = (
  error: InternalValidationError,
  dictionary: Dictionary
): InternalValidationError => {
  if (isTranslated(error)) {
    return error;
  }

  const translateFromDictionary = dictionary[error.kind];

  if (translateFromDictionary) {
    return {
      ...error,
      message: translateFromDictionary(error.params as never),
    };
  }

  return error;
};