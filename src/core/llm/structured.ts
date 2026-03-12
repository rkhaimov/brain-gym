import { z } from 'zod';
import { Either } from '../../utils/Either';
import { JSONString, Schema, SchemaParseFailure } from '../../utils/Schema';
import { Stream } from '../../utils/Stream';
import { Message } from './types/message-types';
import { LLMResponseChunk } from './types/response-chunk-types';
import { LLM, LLMFailure } from './types/types';

type Structured = <T extends z.ZodType>(config: {
  llm: LLM;
  schema: T;
  messages: Message[];
}) => StructuredResult<T>;

type StructuredResult<T extends z.ZodType> = Stream<
  LLMResponseChunk,
  Either<StructuredFailure, z.Infer<T>>
>;

export type StructuredFailure = LLMFailure | SchemaParseFailure;

export const structured: Structured = async function* ({
  llm,
  schema,
  messages,
}) {
  const result = yield* llm({
    messages,
    tools: [],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'extract',
        strict: true,
        schema: Schema.toJSONSchema(schema),
      },
    },
  });

  if (Either.isLeft(result)) {
    return result;
  }

  return Schema.parseJSON(schema, result.value.content as JSONString);
};
