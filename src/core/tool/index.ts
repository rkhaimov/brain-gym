import { z } from 'zod';
import { Either } from '../../utils/Either';
import { Schema } from '../../utils/Schema';
import { Stream } from '../../utils/Stream';
import { LLMResponseChunk } from '../llm/response-chunk-types';
import { ToolName } from '../llm/tool-types';
import { Tool, ToolResult } from './types';

export function tool<T extends z.ZodType>(config: {
  name: string;
  description: string;
  schema: T;
  fn(arg: z.Infer<T>): Stream<LLMResponseChunk, string>;
}): Tool {
  const name = config.name as ToolName;

  return {
    meta: {
      function: {
        name,
        description: config.description,
        parameters: Schema.toJSONSchema(config.schema),
      },
    },
    run: async function* (args): ToolResult {
      const parsed = Schema.parseJSON(config.schema, args);

      if (Either.isLeft(parsed)) {
        return Either.right({
          role: 'tool',
          name,
          content: `Arguments parsing error, correct your mistakes ${parsed.value.body}`,
        });
      }

      try {
        const result = yield* config.fn(parsed.value);

        return Either.right({ role: 'tool', name, content: result });
      } catch (error: unknown) {
        return Either.left({ kind: 'ToolCallFailure', body: error });
      }
    },
  };
}
