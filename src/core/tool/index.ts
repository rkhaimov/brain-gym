import { ToolName } from '../llm/tool-types';
import { Either } from '../../utils/Either';
import { Schema } from '../../utils/schema';
import { Tool } from './types';

export function tool<T>(config: {
  name: string;
  description: string;
  schema: Schema<T>;
  fn(arg: T): Promise<string>;
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
    run: async (args) => {
      const parsed = Schema.parse(config.schema, args);

      if (Either.isLeft(parsed)) {
        return parsed;
      }

      try {
        const result = await config.fn(parsed.value);

        return Either.right({ role: 'tool', name, content: result });
      } catch (error: unknown) {
        return Either.left({ kind: 'ToolCallFailure', body: error });
      }
    },
  };
}
