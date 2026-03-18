import { Failure } from '@utils/Failure';
import { z } from 'zod';
import { Either } from '@utils/Either';
import { Stream } from '@utils/Stream';
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

/**
 * Returns native structured response (using response format pattern)
 */
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
        schema: schema.toJSONSchema(),
      },
    },
  });

  if (Either.isLeft(result)) {
    return result;
  }

  try {
    const parsed = schema.safeParse(JSON.parse(result.value.content));

    if (parsed.success) {
      return Either.right(parsed.data);
    }

    return Either.left({
      kind: 'SchemaParseFailure',
      body: parsed.error.message,
    });
  } catch (error: unknown) {
    return Either.left({ kind: 'SchemaParseFailure', body: error });
  }
};

export type SchemaParseFailure = Failure<'SchemaParseFailure', unknown>;
