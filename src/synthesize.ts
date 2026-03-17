import { Source } from './classify';
import { openai } from './core/llm/openai';
import { AssistantMessage } from './core/llm/types/message-types';
import { LLMFailure } from './core/llm/types/types';
import { LLMState } from './core/LLMState';
import { Stream } from './utils/Stream';
import { Task } from './utils/Task';

export type Result = {
  source: Source;
  message: AssistantMessage;
};

export async function synthesize(
  query: string,
  results: Result[],
): Task<LLMFailure, AssistantMessage> {
  const state = LLMState.create(`
  Synthesize these search results to answer the original question: "${query}"
  
  - Combine information from multiple sources without redundancy
  - Highlight the most relevant and actionable information
  - Note any discrepancies between sources
  - Keep the response concise and well-organized
  `);

  const content =
    results.length === 0
      ? 'There is no any source available relevant to a given query'
      : results
          .map(
            ({ source, message }) => `**From ${source}:**\n${message.content}`,
          )
          .join('\n\n');

  const [, result] = await Stream.toPromise(
    openai({
      messages: state.advance({ role: 'user', content }).toHistory(),
    }),
  );

  return result;
}
