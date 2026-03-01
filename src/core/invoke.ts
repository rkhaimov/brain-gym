import { AssistantMessage, Message, ToolCall, ToolMessage } from './message';
import { Either } from '../misc/Either';
import { isNil } from '../misc/utils';
import { LLM } from './llm';
import { Tool } from './tool';

export type InvocationConfig = { llm: LLM; tools: Tool[] };

export async function invoke(
  history: Message[],
  config: InvocationConfig,
): Promise<Either<unknown, [Message[], AssistantMessage]>> {
  const inference = await config.llm({
    tools: config.tools.map((it) => it.meta),
    messages: history,
  });

  if (Either.isLeft(inference)) {
    return inference;
  }

  const [choice] = inference.value.choices;

  if (isNil(choice)) {
    return Either.left('EmptyChoiceReceived');
  }

  const { message } = choice;

  if (isNil(message.tool_calls) || message.tool_calls.length === 0) {
    return Either.right([[...history, message], message]);
  }

  const result = await run(message.tool_calls, config.tools);

  if (Either.isLeft(result)) {
    return result;
  }

  return invoke([...history, message, ...result.value], config);
}

async function run(
  calls: ToolCall[],
  tools: Tool[],
): Promise<Either<unknown, ToolMessage[]>> {
  const [call, ...restCalls] = calls;

  if (isNil(call)) {
    return Either.right([]);
  }

  const tool = tools.find((it) => it.meta.function.name === call.function.name);

  if (isNil(tool)) {
    return Either.left('ToolNotFound');
  }

  const result = await tool.run(call.function.arguments);

  if (Either.isLeft(result)) {
    return result;
  }

  const others = await run(restCalls, tools);

  if (Either.isLeft(others)) {
    return others;
  }

  return Either.right([result.value, ...others.value]);
}
