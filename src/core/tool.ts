import { z } from 'zod';
import { Either } from '../misc/Either';
import { ArgumentsValue, ToolMessage, ToolMeta } from './message';
import { Brand } from '../misc/utils';

export type Tool = {
  meta: ToolMeta;
  run(args: ArgumentsValue): Promise<Either<unknown, ToolMessage>>;
};

export function tool<T extends z.ZodType>(config: {
  name: string;
  description: string;
  schema: T;
  fn(arg: z.Infer<T>): Promise<string>;
}): Tool {
  const name = config.name as ToolName;

  return {
    meta: {
      function: {
        name,
        description: config.description,
        parameters: toJSONSchema(config.schema),
      },
    },
    run: Either.fromAsyncThrowable(async (args) => {
      const parsed = config.schema.parse(JSON.parse(args));
      const result = await config.fn(parsed);

      return { role: 'tool', name, content: result };
    }),
  };
}

export type ToolName = Brand<string, 'ToolName'>;

export type ArgumentsSchema = Brand<unknown, 'ArgumentsSchema'>;

function toJSONSchema(zod: z.ZodType): ArgumentsSchema {
  return zod.toJSONSchema() as unknown as ArgumentsSchema;
}
