import { Either } from '../misc/Either';
import { Failure } from '../misc/failure';
import { Task } from '../misc/Task';
import { isNil } from '../misc/utils';
import { invoke, InvokeFailure } from './invoke';
import { LLM } from './llm';
import { AssistantMessage, Message, ToolCall, ToolMessage } from './message';
import { Tool, ToolFailure } from './tool';

type Agent = (
  history: Message[],
  config: AgentConfig,
) => Task<AgentFailure, { history: Message[]; response: AssistantMessage }>;

export type AgentConfig = { llm: LLM; tools: Tool[] };

export type AgentFailure = InvokeFailure | RunFailure;

export const agent: Agent = async (history, config) => {
  const inference = await invoke(history, config);

  if (Either.isLeft(inference)) {
    return inference;
  }

  const message = inference.value;

  if (isNil(message.tool_calls) || message.tool_calls.length === 0) {
    return Either.right({ history: [...history, message], response: message });
  }

  const result = await run(message.tool_calls, config.tools);

  if (Either.isLeft(result)) {
    return result;
  }

  return agent([...history, message, ...result.value], config);
};

type RunFailure = ToolFailure | Failure<'RunToolMissing', void>;

async function run(
  calls: ToolCall[],
  tools: Tool[],
): Task<RunFailure, ToolMessage[]> {
  const [call, ...restCalls] = calls;

  if (isNil(call)) {
    return Either.right([]);
  }

  const tool = tools.find((it) => it.meta.function.name === call.function.name);

  if (isNil(tool)) {
    return Either.left({ kind: 'RunToolMissing', body: undefined });
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
