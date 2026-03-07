import { Either } from '../misc/Either';
import { Failure } from '../misc/failure';
import { isNil } from '../misc/utils';
import { invoke, InvokeConfig, InvokeFailure, ToolsRegistry } from './invoke';
import { AssistantContentChunk } from './llm';
import { Message, ToolCall, ToolMessage, ToolName } from './message';
import { ToolFailure } from './tool';

export type AgentFailure = InvokeFailure | RunFailure;

type AgentResult = AsyncGenerator<
  AssistantContentChunk,
  Either<AgentFailure, Message[]>,
  void
>;

export async function* agent(
  history: Message[],
  config: InvokeConfig,
): AgentResult {
  const inference = yield* invoke(history, config);

  if (Either.isLeft(inference)) {
    return inference;
  }

  const { message, tools } = inference.value;

  if (message.tool_calls.length === 0) {
    return Either.right([...history, message]);
  }

  const ran = await run(message.tool_calls, tools);

  if (Either.isLeft(ran)) {
    return ran;
  }

  return yield* agent([...history, message, ...ran.value], config);
}

type RunFailure = ToolFailure | Failure<'ToolNotFound', ToolName>;

async function run(
  calls: ToolCall[],
  tools: ToolsRegistry,
): Promise<Either<RunFailure, ToolMessage[]>> {
  const [call, ...others] = calls;

  if (isNil(call)) {
    return Either.right([]);
  }

  const tool = tools.get(call.function.name);

  if (isNil(tool)) {
    return Either.left({ kind: 'ToolNotFound', body: call.function.name });
  }

  const result = await tool.run(call.function.arguments);

  if (Either.isLeft(result)) {
    return result;
  }

  const rest = await run(others, tools);

  if (Either.isLeft(rest)) {
    return rest;
  }

  return Either.right([result.value, ...rest.value]);
}
