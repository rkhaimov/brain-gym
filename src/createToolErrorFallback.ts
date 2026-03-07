import { Either } from './utils/Either';
import { Tool } from './core/tool/types';

export function createToolErrorFallback(tool: Tool): Tool {
  return {
    meta: tool.meta,
    run: async (args) => {
      const result = await tool.run(args);

      if (Either.isRight(result)) {
        return result;
      }

      return Either.right({
        role: 'tool',
        name: tool.meta.function.name,
        content: `Tool error: Please check your input and try again. ${result.value.kind}: ${result.value.body}`,
      });
    },
  };
}
