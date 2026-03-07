import { AssistantMessage, Message } from '../llm/message-types';
import {
  AssistantContentChunk,
  LLMResponseChunk,
} from '../llm/response-chunk-types';
import { LLM, LLMFailure } from '../llm/types';
import { Tool } from '../tool/types';
import { Either } from '../../utils/Either';
import { RStream } from '../../utils/RStream';
import {
  AssistantParseFailure,
  createAssistantMessage,
} from './createAssistantMessage';

type Invoke = (history: Message[], config: InvokeConfig) => InvokeResult;

type InvokeResult = RStream<
  AssistantContentChunk,
  Either<InvokeFailure, AssistantMessage>
>;

export type InvokeFailure = LLMFailure | AssistantParseFailure;

export type InvokeConfig = { llm: LLM; tools: Tool[] };

export const invoke: Invoke = async function* (history, config) {
  const inference = config.llm({
    messages: history,
    tools: config.tools.map((it) => it.meta),
  });

  const chunks: LLMResponseChunk[] = [];
  while (true) {
    const iter = await inference.next();

    if (iter.done) {
      return Either.isLeft(iter.value)
        ? iter.value
        : createAssistantMessage(chunks);
    }

    chunks.push(iter.value);

    const content = iter.value.choices[0]?.delta.content;

    if (content) {
      yield content;
    }
  }
};
