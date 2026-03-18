import { ToolMeta, ToolName } from '@lib/llm/types/tool-types';
import { Tool, ToolFn } from '@lib/tool/types';
import { z } from 'zod';

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
      parameters: config.schema.toJSONSchema(),
    },
  };

  return {
    meta,
    schema: config.schema,
    run: (args, context) =>
      config.fn(
        args as never /* using assertion here to simplify public Tool type */,
        context,
      ),
  };
}
