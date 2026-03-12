import { z } from 'zod';
import { openai } from './core/llm/openai';
import { LLMResponseChunk } from './core/llm/types/response-chunk-types';
import { LLMFailure } from './core/llm/types/types';
import { LLMState } from './core/LLMState';
import { tool } from './core/tool';
import { ask, AskFailure } from './core/user/ask';
import { Either } from './utils/Either';
import { Stream } from './utils/Stream';
import { isNil } from './utils/utils';

export async function* createIssueTypeAgent() {
  return yield* run(LLMState.create(SYSTEM_PROMPT));
}

async function* run(
  state: LLMState,
): Stream<
  LLMResponseChunk,
  Either<
    LLMFailure | AskFailure,
    { type: z.Infer<typeof IssueTypeSchema>; state: LLMState }
  >
> {
  const inference = yield* openai({
    messages: state.toHistory(),
    tools: [createIssueType.meta],
  });

  if (Either.isLeft(inference)) {
    return inference;
  }

  const message = inference.value;
  const [call] = message.tool_calls;

  if (isNil(call)) {
    const asked = await ask();

    if (Either.isLeft(asked)) {
      return asked;
    }

    return yield* run(
      state.advance(message, { role: 'user', content: asked.value }),
    );
  }

  if (call.function.name !== createIssueType.meta.function.name) {
    return yield* run(
      state.advance(message, {
        role: 'user',
        content: `The only tool available is ${createIssueType.meta.function.name}`,
      }),
    );
  }

  const ran = createIssueType.run(call.function.arguments);

  if (Either.isLeft(ran)) {
    return yield* run(state.advance(message, ran.value));
  }

  return Either.right({ state, type: ran.value });
}

export const IssueTypeSchema = z.enum(['hardware', 'software']);

const createIssueType = tool({
  name: 'toIssueType',
  description:
    'Record the type of issue and transition to resolution specialist.',
  schema: z.object({ type: IssueTypeSchema }),
  fn: ({ type }) => Either.right(type),
});

const SYSTEM_PROMPT = `
You are a customer support agent helping with device issues.
  
You need to:
1. Welcome customer and ask to describe their issue
2. Judging by user response determine if it's a hardware issue (physical damage, broken parts) or software issue (app crashes, performance)
3. Use ${createIssueType.meta.function.name} to record the classification and move to the next step
  
If unclear, ask clarifying questions before classifying.
`;
