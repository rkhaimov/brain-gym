import { agent, AgentFailure } from './core/agent';
import { InvokeConfig } from './core/invoke';
import { Message, SystemMessage } from './core/llm/message-types';
import { AssistantContentChunk } from './core/llm/response-chunk-types';
import { ask, AskFailure } from './core/user/ask';
import { Either } from './utils/Either';

export function chat(system: SystemMessage, config: InvokeConfig) {
  return _chat(
    [
      system,
      {
        role: 'user',
        content:
          'Present yourself by describing your role and main capabilities.',
      },
    ],
    config,
  );
}

type Chat = (
  history: Message[],
  config: InvokeConfig,
) => AsyncGenerator<AssistantContentChunk, ChatFailure, void>;

type ChatFailure = AgentFailure | AskFailure;

const _chat: Chat = async function* (history, config) {
  const messages = yield* agent(history, config);

  if (Either.isLeft(messages)) {
    return messages.value;
  }

  const question = await ask();

  if (Either.isLeft(question)) {
    return question.value;
  }

  return yield* _chat([...messages.value, question.value], config);
};
