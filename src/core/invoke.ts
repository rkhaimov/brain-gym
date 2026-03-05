import { Either } from '../misc/Either';
import { Failure } from '../misc/failure';
import { Task } from '../misc/Task';
import { isNil } from '../misc/utils';
import { LLM, LLMFailure } from './llm';
import { AssistantMessage, Message } from './message';
import { Tool } from './tool';

type Invoke = (
  messages: Message[],
  config: InvokeConfig,
) => Task<InvokeFailure, AssistantMessage>;

export type InvokeFailure = LLMFailure | Failure<'LLMBadResponse', void>;

type InvokeConfig = { llm: LLM; tools: Tool[] };

export const invoke: Invoke = async (messages, config) => {
  const inference = await config.llm({
    messages,
    tools: config.tools.map((it) => it.meta),
  });

  if (Either.isLeft(inference)) {
    return inference;
  }

  const [choice] = inference.value.choices;

  if (isNil(choice)) {
    return Either.left({ kind: 'LLMBadResponse', body: undefined });
  }

  return Either.right(choice.message);
};
