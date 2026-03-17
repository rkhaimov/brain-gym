import { z } from 'zod';
import { openai } from './core/llm/openai';
import { AssistantMessage } from './core/llm/types/message-types';
import { LLMFailure } from './core/llm/types/types';
import { LLMState } from './core/LLMState';
import { tool } from './core/tool';
import { emulated } from './emulated';
import { run } from './run';
import { Either } from './utils/Either';
import { Stream } from './utils/Stream';
import { Task } from './utils/Task';

export async function createSlackExpert(
  query: string,
): Task<LLMFailure, AssistantMessage> {
  let state = LLMState.create(SYSTEM_PROMPT).advance({
    role: 'user',
    content: query,
  });

  while (true) {
    const [, inference] = await Stream.toPromise(
      openai({
        messages: state.toHistory(),
        tools: [search.meta, getThread.meta],
      }),
    );

    if (Either.isLeft(inference)) {
      return inference;
    }

    const message = inference.value;

    if (message.tool_calls.length === 0) {
      return Either.right(message);
    }

    const ran = await run(message.tool_calls, [search, getThread]);

    state = state.advance(message, ...ran);
  }
}

const SYSTEM_PROMPT = `
You are a Slack expert. Answer questions by searching
relevant threads and discussions where team members have
shared knowledge and solutions.
`;

const search = tool({
  name: 'search',
  description: 'Search Slack messages and threads.',
  schema: z.object({ query: z.string() }),
  fn: emulated(openai),
});

const getThread = tool({
  name: 'getThread',
  description: 'Get a specific Slack thread.',
  schema: z.object({ threadId: z.string() }),
  fn: emulated(openai),
});
