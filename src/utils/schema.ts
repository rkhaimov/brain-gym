import { z } from 'zod';
import { Either } from './Either';
import { Failure } from './Failure';
import { Brand } from './utils';

export type Schema<T> = Brand<{ __type: T }, 'Schema'>;

export type JSONSchema = Brand<unknown, 'JSONSchema'>;

export type JSONString = Brand<string, 'JSONString'>;

export type SchemaParseFailure = Failure<'SchemaParseFailure', unknown>;

export const Schema = {
  create: <T extends z.ZodType>(scheme: T) =>
    scheme as unknown as Schema<z.Infer<T>>,
  parse: <T>(
    schema: Schema<T>,
    json: JSONString,
  ): Either<SchemaParseFailure, T> => {
    try {
      const raw = JSON.parse(json);
      const parsed = (schema as unknown as z.ZodType<T>).safeParse(raw);

      return parsed.success
        ? Either.right(parsed.data)
        : Either.left({
            kind: 'SchemaParseFailure',
            body: parsed.error.message,
          });
    } catch (error: unknown) {
      return Either.left({ kind: 'SchemaParseFailure', body: error });
    }
  },
  toJSONSchema: (schema: Schema<unknown>) =>
    (schema as unknown as z.ZodType).toJSONSchema() as unknown as JSONSchema,
};
