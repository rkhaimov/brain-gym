import { ask } from './core/user/ask';
import { Either } from './utils/Either';
import { Tool } from './core/tool/types';

export function createHITLTool(tool: Tool): Tool {
  return {
    meta: tool.meta,
    run: async (args) => {
      console.log(
        `Do you allow for ${tool.meta.function.name} to be called with following args:`,
      );

      console.log(args);

      console.log('Type yes or rejection reason');

      const answer = await ask();

      if (Either.isLeft(answer)) {
        return Either.left({ kind: 'ToolCallFailure', body: answer.value });
      }

      if (answer.value.content === 'yes') {
        return tool.run(args);
      }

      return Either.right({
        role: 'tool',
        name: tool.meta.function.name,
        content: `Tool call rejected. Reason: ${answer.value.content}`,
      });
    },
  };
}
