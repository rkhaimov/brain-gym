import { z } from 'zod';
import { logged } from './core/llm/logged';
import { openai } from './core/llm/openai';
import { LLMResponseChunk } from './core/llm/types/response-chunk-types';
import { LLMFailure } from './core/llm/types/types';
import { LLMState } from './core/LLMState';
import { ask, AskFailure } from './core/user/ask';
import { IssueTypeSchema } from './createIssueTypeAgent';
import { WarrantyStatusSchema } from './createWarrantyCollectorAgent';
import { Either } from './utils/Either';
import { Stream } from './utils/Stream';

export function createResolutionAgent(
  state: LLMState,
  type: z.Infer<typeof IssueTypeSchema>,
  warranty: z.Infer<typeof WarrantyStatusSchema>,
) {
  return run(state.clone(createSystemPrompt(type, warranty)));
}

async function* run(
  state: LLMState,
): Stream<LLMResponseChunk, Either<LLMFailure | AskFailure, never>> {
  const inference = yield* openai({
    messages: state.toHistory(),
    tools: [],
  });

  if (Either.isLeft(inference)) {
    return inference;
  }

  const asked = await ask();

  if (Either.isLeft(asked)) {
    return asked;
  }

  return yield* run(
    state.advance(inference.value, { role: 'user', content: asked.value }),
  );
}

function createSystemPrompt(
  type: z.Infer<typeof IssueTypeSchema>,
  warranty: z.Infer<typeof WarrantyStatusSchema>,
) {
  return `
  You are a customer support agent helping with device issues.
  
  CUSTOMER INFO: issue type is ${type}, warranty status is ${warranty}
  
  At this step, you need to:
  1. For SOFTWARE issues: provide troubleshooting steps
  2. For HARDWARE issues: explain warranty repair process
  
  Be specific and helpful in your solutions.
  `;
}
