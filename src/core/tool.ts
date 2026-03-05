import { z } from 'zod';
import { Either } from '../misc/Either';
import { Failure } from '../misc/failure';
import { Task } from '../misc/Task';
import { Brand } from '../misc/utils';
import { ArgumentsValue, ToolMessage, ToolMeta } from './message';

export type Tool = {
  meta: ToolMeta;
  run(args: ArgumentsValue): Task<ToolFailure, ToolMessage>;
};

export type ToolFailure =
  | Failure<'ToolInvalidArguments', string>
  | Failure<'ToolCallFailure', unknown>;

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
    run: async (args) => {
      const parsed = config.schema.safeParse(JSON.parse(args));

      if (parsed.error) {
        return Either.left({
          kind: 'ToolInvalidArguments',
          body: JSON.stringify(parsed.error.issues),
        });
      }

      try {
        const result = await config.fn(parsed.data);

        return Either.right({ role: 'tool', name, content: result });
      } catch (error: unknown) {
        return Either.left({ kind: 'ToolCallFailure', body: error });
      }
    },
  };
}

export type ToolName = Brand<string, 'ToolName'>;

export type ArgumentsSchema = Brand<unknown, 'ArgumentsSchema'>;

function toJSONSchema(zod: z.ZodType): ArgumentsSchema {
  return zod.toJSONSchema() as unknown as ArgumentsSchema;
}
