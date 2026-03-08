import { Either } from '../../utils/Either';
import { Failure } from '../../utils/Failure';
import { isDefined, isNil } from '../../utils/utils';
import { AssistantContent, AssistantMessage } from '../llm/message-types';
import { LLMResponseChunk } from '../llm/response-chunk-types';
import { ToolArguments, ToolCallID } from '../llm/tool-types';

export type AssistantMessageFailure = Failure<
  'AssistantMessageFailure',
  string
>;

export function createAssistantMessage(
  chunks: LLMResponseChunk[],
): Either<AssistantMessageFailure, AssistantMessage> {
  return chunks.reduce(concat, Either.right(createNullMessage()));
}

function createNullMessage(): AssistantMessage {
  return {
    role: 'assistant',
    content: '' as AssistantContent,
    tool_calls: [],
  };
}

function concat(
  message: Either<AssistantMessageFailure, AssistantMessage>,
  chunk: LLMResponseChunk,
): Either<AssistantMessageFailure, AssistantMessage> {
  const [choice] = chunk.choices;

  if (isNil(choice)) {
    return message;
  }

  if (isNil(choice.delta.tool_calls)) {
    if (isNil(choice.delta.content)) {
      return message;
    }

    if (Either.isLeft(message)) {
      return message;
    }

    message.value.content =
      `${message.value.content}${choice.delta.content}` as AssistantContent;

    return message;
  }

  const [call] = choice.delta.tool_calls;

  if (isNil(call)) {
    return message;
  }

  const name = call.function.name;

  if (isDefined(name)) {
    if (Either.isLeft(message)) {
      return message;
    }

    message.value.tool_calls.push({
      id: createToolCallID(),
      type: 'function',
      function: {
        name,
        arguments: '' as ToolArguments,
      },
    });

    return message;
  }

  if (isNil(call.function.arguments)) {
    return Either.left({
      kind: 'AssistantMessageFailure',
      body: 'Tool arguments are empty',
    });
  }

  if (Either.isLeft(message)) {
    return message;
  }

  const tool = message.value.tool_calls[call.index];

  if (isNil(tool)) {
    return Either.left({
      kind: 'AssistantMessageFailure',
      body: 'Tool was not found by index',
    });
  }

  tool.function.arguments =
    `${tool.function.arguments}${call.function.arguments}` as ToolArguments;

  return message;
}

let id = 0;

function createToolCallID(): ToolCallID {
  id += 1;

  return `${id}` as ToolCallID;
}
