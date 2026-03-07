import { Either } from '../utils/Either';
import { RStream } from '../utils/RStream';
import { JSONString, Schema, SchemaParseFailure } from '../utils/schema';
import { Message } from './llm/message-types';
import { LLM, LLMFailure } from './llm/types';

type Structured = <T>(
  history: Message[],
  config: {
    llm: LLM;
    schema: Schema<T>;
  },
) => Promise<Either<StructuredFailure, T>>;

type StructuredFailure = LLMFailure | SchemaParseFailure;

export const structured: Structured = async (history, config) => {
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

  const [chunks, result] = await RStream.toPromise(inference);

  if (Either.isLeft(result)) {
    return result;
  }

  const json = chunks
    .map((it) => it.choices[0]?.delta.content)
    .join('') as JSONString;

  return Schema.parse(config.schema, json);
};
