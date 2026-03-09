import { invoke } from '../core/invoke';
import { LLM } from '../core/llm/types';
import { Tool } from '../core/tool/types';
import { Either } from '../utils/Either';

export function createLLMEmulatedTool(tool: Tool, llm: LLM): Tool {
  return {
    meta: tool.meta,
    run: async function* (args) {
      const SYSTEM_PROMPT = `
      You are emulating a tool call for testing purposes.

      Tool: ${tool.meta.function.name}
      Description: ${tool.meta.function.description}
      Arguments: ${args}
    
      Generate a realistic response that this tool would return given these arguments.
      Return ONLY the tool's output, no explanation or preamble. Introduce variation into your responses.
      `;

      const result = yield* invoke([{ role: 'user', content: SYSTEM_PROMPT }], {
        llm,
        tools: [],
      });

      if (Either.isLeft(result)) {
        return Either.left({ kind: 'ToolCallFailure', body: result.value });
      }

      return Either.right({
        role: 'tool',
        name: tool.meta.function.name,
        content: result.value.content,
      });
    },
  };
}
