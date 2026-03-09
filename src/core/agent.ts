import { Either } from '../utils/Either';
import { Failure } from '../utils/Failure';
import { Stream } from '../utils/Stream';
import { isNil } from '../utils/utils';
import { invoke, InvokeConfig, InvokeFailure } from './invoke';
import { Message } from './llm/message-types';
import { LLMResponseChunk } from './llm/response-chunk-types';
import { ToolCall, ToolMessage, ToolName } from './llm/tool-types';
import { Tool, ToolFailure } from './tool/types';

export type Agent = (messages: Message[], config: InvokeConfig) => AgentResult;

export type AgentResult = Stream<
  LLMResponseChunk | ToolCall,
  Either<AgentFailure, Message[]>
>;

export type AgentFailure = InvokeFailure | ToolFailure;

export const agent: Agent = async function* (_messages, config) {
  const messages = [..._messages];

  while (true) {
    const inference = yield* invoke(messages, config);

    if (Either.isLeft(inference)) {
      return inference;
    }

    const message = inference.value;

    if (message.tool_calls.length === 0) {
      return Either.right([...messages, message]);
    }

    const ran = yield* run(message.tool_calls, config.tools);

    if (Either.isRight(ran)) {
      messages.push(message, ...ran.value);

      continue;
    }

    const failure = ran.value;

    if (failure.kind === 'ToolCallFailure') {
      return Either.left(failure);
    }

    messages.push({
      role: 'user',
      content: `Tool ${failure.body} was not found, use one of ${config.tools.map((it) => it.meta.function.name).join(', ')}`,
    });
  }
};

type RunFailure = ToolFailure | Failure<'ToolNotFound', ToolName>;

async function* run(
  calls: ToolCall[],
  tools: Tool[],
): Stream<ToolCall | LLMResponseChunk, Either<RunFailure, ToolMessage[]>> {
  const results: ToolMessage[] = [];

  for (const call of calls) {
    yield call;

    const tool = tools.find(
      (it) => it.meta.function.name === call.function.name,
    );

    if (isNil(tool)) {
      return Either.left({ kind: 'ToolNotFound', body: call.function.name });
    }

    const result = yield* tool.run(call.function.arguments);

    if (Either.isLeft(result)) {
      return result;
    }

    results.push(result.value);
  }

  return Either.right(results);
}
