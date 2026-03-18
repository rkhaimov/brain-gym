import { runTools } from '@lib/llm/interactive/runTools';
import { LLMResponseChunk } from '@lib/llm/types/response-chunk-types';
import { LLM, LLMFailure } from '@lib/llm/types/types';
import { LLMState } from '@lib/LLMState';
import { tool } from '@lib/tool/tool';
import { FeedbackTool } from '@lib/tool/types';
import { Either } from '@utils/Either';
import { Stream } from '@utils/Stream';
import { z } from 'zod';
import { Conversation } from '../../../src/Conversation';

type Interactive = <T extends z.ZodType>(config: {
  llm: LLM;
  system: string;
  query: string;
  tools: FeedbackTool[];
  response: {
    schema: T;
    description: string;
  };
}) => Stream<LLMResponseChunk, Either<LLMFailure, [Conversation, z.Infer<T>]>>;

export const interactive: Interactive = async function* (config) {
  const feedback = [...config.tools, Conversation.tool];

  const finalize = tool({
    name: 'finalize',
    description: config.response.description,
    schema: config.response.schema,
    fn: (arg) => arg,
  });

  let state = LLMState.create(
    `${config.system}\n\n${createNativeToolsInstructions()}`,
  ).advance({ role: 'user', content: config.query });

  while (true) {
    const inference = yield* config.llm({
      tools: [...feedback.map((it) => it.meta), finalize.meta],
      messages: state.toNative(),
    });

    if (Either.isLeft(inference)) {
      return inference;
    }

    const result = await runTools(state, inference.value, finalize, feedback);

    if (result.type === 'end') {
      return Either.right([Conversation.fromState(state), result.value]);
    }

    state = state.advance(inference.value, ...result.value);
  }
};

function createNativeToolsInstructions() {
  return `
    # Interaction Policies (MUST FOLLOW)
    
    ## \`ask\` Tool
    
    When ambiguity blocks correctness, ask one targeted clarification question through the \`ask\` tool.
    Include: what is missing, why it blocks correctness, and what decision will be made after the answer.
    Do not ask if a deterministic choice can be made from provided inputs and rules.
    
    ## \`finalize\` Tool
    
    Emit the final response through the \`finalize\` tool. The payload must conform to the selected output schema.
  `;
}
