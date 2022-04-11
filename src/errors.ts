import { InternalValidationError, ValidationError } from './core';
import { number } from './primitives';

export const prependErrorPathWith =
  (path: InternalValidationError['paths'][number]) =>
  (error: InternalValidationError): InternalValidationError => {
    return { paths: [path, ...error.paths], message: error.message };
  };

export const toValidationError = (
  error: InternalValidationError
): ValidationError => {
  return {
    path: toPath(error.paths),
    message: error.message,
  };
};

export const toReadableErrors = (errors: InternalValidationError[]): string => {
  return errors.map(toReadableError).join('\n');
};

const toReadableError = (error: InternalValidationError): string => {
  return `${error.paths.length === 0 ? 'Empty path' : toPath(error.paths)}: ${
    error.message
  }`;
};

const toPath = (paths: InternalValidationError['paths']): string => {
  return paths
    .map((path) => (typeof path === 'number' ? `[${path}]` : path))
    .join('.')
    .replace(/\.\[/, '[');
};
