import { ask } from './ask';
import { InvocationConfig, invoke } from './core/invoke';
import { Message, SystemMessage } from './core/message';
import { Either } from './misc/Either';

export function chat(system: SystemMessage, config: InvocationConfig) {
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

async function _chat(
  history: Message[],
  config: InvocationConfig,
): Promise<Either<unknown, never>> {
  const result = await invoke(history, config);

  if (Either.isLeft(result)) {
    return result;
  }

  const [_history, message] = result.value;

  const answer = await ask(message.content);

  if (Either.isLeft(answer)) {
    return answer;
  }

  return _chat([..._history, answer.value], config);
}
