import { agent, AgentFailure } from './core/agent';
import { InvokeConfig } from './core/invoke';
import { Message } from './core/llm/message-types';
import { LLMResponseChunk } from './core/llm/response-chunk-types';
import { ask, AskFailure } from './core/user/ask';
import { Either } from './utils/Either';

export async function* chat(
  { system, welcome }: { system: string; welcome: string },
  config: InvokeConfig,
) {
  yield { choices: [{ delta: { content: welcome } }] };

  return yield* _chat(
    [
      { role: 'system', content: system },
      { role: 'assistant', content: welcome, tool_calls: [] },
    ],
    config,
  );
}

type Chat = (
  history: Message[],
  config: InvokeConfig,
) => AsyncGenerator<LLMResponseChunk, ChatFailure, void>;

type ChatFailure = AgentFailure | AskFailure;

const _chat: Chat = async function* (history, config) {
  const question = await ask();

  if (Either.isLeft(question)) {
    return question.value;
  }

  const messages = yield* agent([...history, question.value], config);

  if (Either.isLeft(messages)) {
    return messages.value;
  }

  return yield* _chat(messages.value, config);
};
