import { z } from 'zod';
import { Either } from '../utils/Either';
import { Stream } from '../utils/Stream';
import { JSONString, Schema, SchemaParseFailure } from '../utils/Schema';
import { Message } from './llm/message-types';
import { LLMResponseChunk } from './llm/response-chunk-types';
import { LLM, LLMFailure } from './llm/types';

type Structured = <T extends z.ZodType>(
  messages: Message[],
  config: {
    llm: LLM;
    schema: T;
  },
) => StructuredResult<T>;

type StructuredResult<T extends z.ZodType> = Stream<
  LLMResponseChunk,
  Either<StructuredFailure, z.Infer<T>>
>;

export type StructuredFailure = LLMFailure | SchemaParseFailure;

export const structured: Structured = async function* (history, config) {
  const inference = config.llm({
    tools: [],
    messages: history,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'extract',
        strict: true,
        schema: Schema.toJSONSchema(config.schema),
      },
    },
  });

  const [chunks, result] = yield* Stream.toFold(inference);

  if (Either.isLeft(result)) {
    return result;
  }

  const json = chunks
    .map((it) => it.choices[0]?.delta.content)
    .join('') as JSONString;

  return Schema.parseJSON(config.schema, json);
};
