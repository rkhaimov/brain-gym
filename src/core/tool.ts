import { z } from 'zod';
import { Either } from '../misc/Either';
import { Failure } from '../misc/failure';
import {
  ArgumentsSchema,
  ToolArguments,
  ToolMessage,
  ToolMeta,
  ToolName,
} from './message';

export type Tool = {
  meta: ToolMeta;
  run(args: ToolArguments): Promise<Either<ToolFailure, ToolMessage>>;
};

export type ToolFailure =
  | Failure<'ToolInvalidArgumentsJSON', ToolArguments>
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
      const raw = toRawObject(args);

      if (Either.isLeft(raw)) {
        return raw;
      }

      const parsed = config.schema.safeParse(raw.value);

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

function toJSONSchema(zod: z.ZodType): ArgumentsSchema {
  return zod.toJSONSchema() as unknown as ArgumentsSchema;
}

function toRawObject(args: ToolArguments): Either<ToolFailure, unknown> {
  try {
    return Either.right(JSON.parse(args));
  } catch (_) {
    return Either.left({ kind: 'ToolInvalidArgumentsJSON', body: args });
  }
}
