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

export async function createGithubExpert(
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
        tools: [searchCode.meta, searchIssues.meta],
      }),
    );

    if (Either.isLeft(inference)) {
      return inference;
    }

    const message = inference.value;

    if (message.tool_calls.length === 0) {
      return Either.right(message);
    }

    const ran = await run(message.tool_calls, [searchCode, searchIssues]);

    state = state.advance(message, ...ran);
  }
}

const SYSTEM_PROMPT = `
You are a GitHub expert. Answer questions about code,
API references, and implementation details by searching
repositories, issues, and pull requests
`;

const searchCode = tool({
  name: 'searchCode',
  description: 'Search code in GitHub repositories',
  schema: z.object({
    query: z.string(),
    repository: z.string().optional().default('main'),
  }),
  fn: emulated(openai),
});

const searchIssues = tool({
  name: 'searchIssues',
  description: 'Search GitHub issues',
  schema: z.object({ query: z.string() }),
  fn: emulated(openai),
});
