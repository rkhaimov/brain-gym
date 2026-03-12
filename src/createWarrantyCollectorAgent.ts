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

export async function* createWarrantyCollectorAgent(state: LLMState) {
  return yield* run(state.clone(SYSTEM_PROMPT));
}

async function* run(
  state: LLMState,
): Stream<
  LLMResponseChunk,
  Either<
    LLMFailure | AskFailure,
    { status: z.Infer<typeof WarrantyStatusSchema>; state: LLMState }
  >
> {
  const inference = yield* openai({
    messages: state.toHistory(),
    tools: [createWarrantyStatus.meta],
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

  if (call.function.name !== createWarrantyStatus.meta.function.name) {
    return yield* run(
      state.advance(message, {
        role: 'user',
        content: `The only tool available is ${createWarrantyStatus.meta.function.name}`,
      }),
    );
  }

  const ran = createWarrantyStatus.run(call.function.arguments);

  if (Either.isLeft(ran)) {
    return yield* run(state.advance(message, ran.value));
  }

  return Either.right({ state, status: ran.value });
}

export const WarrantyStatusSchema = z.enum(['in_warranty', 'out_of_warranty']);

const createWarrantyStatus = tool({
  name: 'createWarrantyStatus',
  description:
    "Record the customer's warranty status and transition to issue classification.",
  schema: z.object({ status: WarrantyStatusSchema }),
  fn: ({ status }) => Either.right(status),
});

const SYSTEM_PROMPT = `
You are a customer support agent helping with device issues.

You need to:
1. Check device warranty status. If unsure, ask a customer
2. Use ${createWarrantyStatus.meta.function.name} to record their response and move to the next step

Rules:
1. Only customer knows about warranty status

Be conversational and friendly. Don't ask multiple questions at once.
`;
