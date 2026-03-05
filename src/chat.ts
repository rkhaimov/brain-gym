import { ask, AskFailure } from './ask';
import { AgentConfig, agent, AgentFailure } from './core/agent';
import { Message, SystemMessage } from './core/message';
import { Either } from './misc/Either';
import { Task } from './misc/Task';

export function chat(system: SystemMessage, config: AgentConfig) {
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
  config: AgentConfig,
) => Task<AskFailure | AgentFailure, never>;

const _chat: Chat = async (history, config) => {
  const result = await agent(history, config);

  if (Either.isLeft(result)) {
    return result;
  }

  const answer = await ask(result.value.response.content);

  if (Either.isLeft(answer)) {
    return answer;
  }

  return _chat([...result.value.history, answer.value], config);
};
