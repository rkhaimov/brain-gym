import { Either } from '../../utils/Either';
import { Stream } from '../../utils/Stream';
import { AssistantMessage, Message } from '../llm/message-types';
import { LLMResponseChunk } from '../llm/response-chunk-types';
import { LLM, LLMFailure } from '../llm/types';
import { Tool } from '../tool/types';
import {
  AssistantMessageFailure,
  createAssistantMessage,
} from './createAssistantMessage';

type Invoke = (messages: Message[], config: InvokeConfig) => InvokeResult;

type InvokeResult = Stream<
  LLMResponseChunk,
  Either<InvokeFailure, AssistantMessage>
>;

export type InvokeFailure = LLMFailure | AssistantMessageFailure;

export type InvokeConfig = { llm: LLM; tools: Tool[] };

export const invoke: Invoke = async function* (messages, config) {
  const inference = config.llm({
    messages,
    tools: config.tools.map((it) => it.meta),
  });

  const [chunks, result] = yield* Stream.toFold(inference);

  if (Either.isLeft(result)) {
    return result;
  }

  return createAssistantMessage(chunks);
};
