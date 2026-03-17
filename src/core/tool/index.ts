import { z } from 'zod';
import { Either } from '../../utils/Either';
import { Schema } from '../../utils/Schema';
import {
  ToolArguments,
  ToolMessage,
  ToolMeta,
  ToolName,
} from '../llm/types/tool-types';

export type Tool<TReturn> = {
  meta: ToolMeta;
  run(args: ToolArguments): TReturn;
};

export type ToolFn<TArgs, TReturn> = (
  args: Either<ToolMessage, TArgs>,
  context: ToolContext,
) => TReturn;

type ToolContext = {
  args: ToolArguments;
  meta: ToolMeta;
};

export function tool<TSchema extends z.ZodType, TReturn>(config: {
  name: string;
  description: string;
  schema: TSchema;
  fn: ToolFn<z.Infer<TSchema>, TReturn>;
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
      const context: ToolContext = { meta, args };
      const parsed = Schema.parseJSON(config.schema, args);

      if (Either.isRight(parsed)) {
        return config.fn(parsed, context);
      }

      return config.fn(
        Either.left({
          role: 'tool',
          name,
          content: `Arguments parsing error, correct your mistakes ${parsed.value.body}`,
        }),
        context,
      );
    },
  };
}
