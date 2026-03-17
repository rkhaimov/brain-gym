import { Either } from '../../utils/Either';
import { isNil } from '../../utils/utils';
import { AssistantMessage } from '../llm/types/message-types';
import { ToolCall } from '../llm/types/tool-types';
import { ActorMessage } from '../LLMState';
import { Tool } from './types';

export async function all(
  message: AssistantMessage,
  tools: MessageTool[],
): Promise<ActorMessage[]> {
  const resolved = resolve(message.tool_calls, tools);

  if (Either.isLeft(resolved)) {
    return [
      {
        role: 'user',
        content: `Tools ${resolved.value.map((it) => it.function.name).join(', ')} were not found. Available tools are ${tools.map((it) => it.meta.function.name).join(', ')}`,
      },
    ];
  }

  const results: ActorMessage[] = [];
  for (const [call, tool] of resolved.value) {
    results.push(await tool.run(call.function.arguments));
  }

  return results;
}

function resolve(
  calls: ToolCall[],
  tools: MessageTool[],
): Either<ToolCall[], [ToolCall, MessageTool][]> {
  const [call, ...others] = calls;

  if (isNil(call)) {
    return Either.right([]);
  }

  const tool = tools.find((it) => it.meta.function.name === call.function.name);

  const rest = resolve(others, tools);

  if (isNil(tool)) {
    return Either.left(Either.isRight(rest) ? [call] : [call, ...rest.value]);
  }

  if (Either.isLeft(rest)) {
    return rest;
  }

  return Either.right([[call, tool], ...rest.value]);
}

type MessageTool = Tool<Awaitable<ActorMessage>>;

type Awaitable<T> = Promise<T> | T;
