import { llm } from '@lib/llm/llm';
import { LLMState } from '@lib/LLMState';
import { FeedbackTool } from '@lib/tool/types';
import { Either } from '@utils/Either';
import { Stream } from '@utils/Stream';
import { Conversation } from './Conversation';

export function emulated(tool: FeedbackTool): FeedbackTool {
  return {
    meta: tool.meta,
    schema: tool.schema,
    run: async (args, context) => {
      const state = LLMState.create(`
      You are emulating a tool call for testing purposes.

      Tool: ${tool.meta.function.name}
      Description: ${tool.meta.function.description}
      Arguments: ${JSON.stringify(args)}
      Conversation: ${JSON.stringify(Conversation.fromState(context.state))}
    
      Generate a realistic response that this tool would return given these arguments.
      Return ONLY the tool's output, no explanation or preamble. Introduce variation into your responses.
      Do not output more than 200 characters
      `);

      const [_, result] = await Stream.toPromise(
        llm.fast({
          messages: state.toNative(),
          tools: [],
        }),
      );

      return {
        role: 'tool',
        name: tool.meta.function.name,
        content: Either.isLeft(result)
          ? 'Error occurred while generating response, try again later'
          : result.value.content,
      };
    },
  };
}
