import { InternalValidationError, TypeNode } from './core';

type FormValidationError = { path: string; message: string };

export const narrow = <TType>(tn: TypeNode<TType>, value: unknown): TType => {
  const errors = tn.validate(value as TType);

  if (errors.length === 0) {
    return value as TType;
  }

  throw new Error(toReadableErrors(errors));
};

export const fromErrorMessage = (message: string): InternalValidationError => {
  return { paths: [], message };
};

export const prependErrorPathWith =
  (path: InternalValidationError['paths'][number]) =>
    (error: InternalValidationError): InternalValidationError => {
      return { paths: [path, ...error.paths], message: error.message };
    };

const toFormValidationError = (
  error: InternalValidationError
): FormValidationError => {
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
