import { z } from 'zod';
import { Either } from '../../utils/Either';
import { Schema } from '../../utils/Schema';
import {
  ToolArguments,
  ToolMessage,
  ToolMeta,
  ToolName,
} from '../llm/types/tool-types';

type Tool<T> = {
  meta: ToolMeta;
  run(args: ToolArguments): ToolResult<T>;
};

type ToolResult<T> = Either<ToolMessage, T>;

export function tool<TSchema extends z.ZodType, TReturn>(config: {
  name: string;
  description: string;
  schema: TSchema;
  fn(arg: z.Infer<TSchema>): ToolResult<TReturn>;
}): Tool<TReturn> {
  const name = config.name as ToolName;

  const meta: ToolMeta = {
    function: {
      name,
      description: config.description,
      parameters: Schema.toJSONSchema(config.schema),
    },
  };

  return {
    meta,
    run: (args) => {
      const parsed = Schema.parseJSON(config.schema, args);

      if (Either.isRight(parsed)) {
        return config.fn(parsed.value);
      }

      return Either.left({
        role: 'tool',
        name,
        content: `Arguments parsing error, correct your mistakes ${parsed.value.body}`,
      });
    },
  };
}
