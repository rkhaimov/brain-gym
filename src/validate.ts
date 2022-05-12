import { ValidationMessages } from 'validation-messages';
import { InternalValidationError, ToType, TypeNode } from './core';

type FormValidationError = { path: string; message: string };

export const narrow = <TType>(tn: TypeNode<TType>, value: unknown): TType => {
  const errors = validate(tn, value as TType);

  if (errors.length === 0) {
    return value as TType;
  }

  throw new Error(toReadableErrors(errors));
};

export const validate = <TType>(tn: TypeNode<TType>, value: TType) =>
  tn.__validate(value).map(tn.translate);

export const defaults = <TType>(tn: TypeNode<TType>) =>
  narrow(tn, tn.defaults());

export const fromErrorMessage = (message: string): InternalValidationError => {
  return { paths: [], message, kind: 'unknown', params: undefined };
};

export const fromKindAndPayload = <TKind extends keyof ValidationMessages>(
  kind: TKind,
  ...payload: ValidationMessages[TKind] extends void
    ? []
    : [ValidationMessages[TKind]]
): InternalValidationError => {
  return {
    paths: [],
    message: `${kind}: ${
      payload[0] ? JSON.stringify(payload[0]) : 'no params'
    }`,
    kind,
    params: payload[0],
  };
};

export const prependErrorPathWith =
  (path: InternalValidationError['paths'][number]) =>
  (error: InternalValidationError): InternalValidationError => {
    return { ...error, paths: [path, ...error.paths] };
  };

export const toFormValidationErrors = (
  errors: InternalValidationError[]
): FormValidationError[] => errors.map(toFormValidationError);

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
