import { ToolMessage } from '../core/llm/types/tool-types';
import { LLM } from '../core/llm/types/types';
import { LLMState } from '../core/LLMState';
import { ToolFn } from '../core/tool';
import { Either } from '../utils/Either';
import { Stream } from '../utils/Stream';

export function emulated(llm: LLM): ToolFn<unknown, Promise<ToolMessage>> {
  return async (args, context) => {
    if (Either.isLeft(args)) {
      return args.value;
    }

    const state = LLMState.create(
      `You are emulating a tool call for testing purposes.

      Tool: ${context.meta.function.name}
      Description: ${context.meta.function.description}
      Arguments: ${context.args}
    
      Generate a realistic response that this tool would return given these arguments.
      Return ONLY the tool's output, no explanation or preamble. Introduce variation into your responses.
      Do not output more than 200 characters`,
    );

    const [, result] = await Stream.toPromise(
      llm({ messages: state.toHistory() }),
    );

    return {
      role: 'tool',
      name: context.meta.function.name,
      content: Either.isLeft(result)
        ? 'Error occurred while generating response, try again later'
        : result.value.content,
    };
  };
}
