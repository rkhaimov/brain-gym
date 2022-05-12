import { MetaDictionary } from 'errors-meta-dictionary';

export type InternalValidationError =
  | ValidationError
  | TranslatedValidationError;

type ValidationError = {
  paths: Array<string | number>;
  kind: keyof MetaDictionary;
  params: MetaDictionary[keyof MetaDictionary];
};

type TranslatedValidationError = ValidationError & {
  message: string;
};

export type FormValidationError = { path: string; message: string };

export const fromErrorMessage = (
  message: string
): TranslatedValidationError => {
  return { paths: [], message, kind: 'unknown', params: undefined };
};

export const fromKindAndPayload = <TKind extends keyof MetaDictionary>(
  kind: TKind,
  ...payload: MetaDictionary[TKind] extends void ? [] : [MetaDictionary[TKind]]
): ValidationError => {
  return {
    paths: [],
    kind,
    params: payload[0],
  };
};

export const prependErrorPathWith =
  (path: InternalValidationError['paths'][number]) =>
  (error: InternalValidationError): InternalValidationError => ({
    ...error,
    paths: [path, ...error.paths],
  });

export const toFormValidationErrors = (
  errors: InternalValidationError[]
): FormValidationError[] => errors.map(toFormValidationError);

const toFormValidationError = (
  error: InternalValidationError
): FormValidationError => {
  return {
    path: toPath(error.paths),
    message: translateDefault(error),
  };
};

export const toReadableErrors = (errors: InternalValidationError[]): string => {
  return errors.map(toReadableError).join('\n');
};

const toReadableError = (error: InternalValidationError): string => {
  const message = isTranslated(error) ? error.message : translateDefault(error);
  const path = error.paths.length === 0 ? '' : `${toPath(error.paths)}: `;

  return `${path}${message}`;
};

const toPath = (paths: InternalValidationError['paths']): string => {
  return paths
    .map((path) => (typeof path === 'number' ? `[${path}]` : path))
    .join('.')
    .replace(/\.\[/, '[');
};

export const translateDefault = (error: ValidationError): string => {
  return `${error.kind}: ${
    error.params === undefined ? 'no params' : JSON.stringify(error.params)
  }`;
};

export const isTranslated = (
  error: InternalValidationError
): error is TranslatedValidationError => 'message' in error;
