import { z } from 'zod';
import { Either } from './Either';
import { Failure } from './Failure';
import { Brand } from './utils';

export const Schema = {
  parseJSON: <T extends z.ZodType>(
    schema: T,
    json: JSONString,
  ): Either<SchemaParseFailure, z.Infer<T>> => {
    try {
      return Schema.parse(schema, JSON.parse(json));
    } catch (error: unknown) {
      return Either.left({ kind: 'SchemaParseFailure', body: error });
    }
  },
  parse: <T extends z.ZodType>(
    schema: T,
    raw: unknown,
  ): Either<SchemaParseFailure, z.Infer<T>> => {
    const parsed = schema.safeParse(raw);

    return parsed.success
      ? Either.right(parsed.data)
      : Either.left({
          kind: 'SchemaParseFailure',
          body: parsed.error.message,
        });
  },
  toJSONSchema: (schema: z.ZodType) =>
    schema.toJSONSchema() as unknown as JSONSchema,
};

export type SchemaParseFailure = Failure<'SchemaParseFailure', unknown>;

export type JSONString = Brand<string, 'JSONString'>;
export type JSONSchema = Brand<unknown, 'JSONSchema'>;
