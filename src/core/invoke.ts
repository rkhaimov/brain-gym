import { Either } from '../misc/Either';
import { Failure } from '../misc/failure';
import { isNil } from '../misc/utils';
import {
  AssistantContentChunk,
  LLM,
  LLMFailure,
  LLMResponse,
  LLMResponseChunk,
  ToolArgumentsChunk,
} from './llm';
import {
  AssistantContent,
  AssistantMessage,
  Message,
  ToolArguments,
  ToolCallID,
  ToolName,
} from './message';
import { Tool } from './tool';

type Invoke = (history: Message[], config: InvokeConfig) => InvokeResult;

type InvokeResult = AsyncGenerator<
  AssistantContentChunk,
  Either<InvokeFailure, AssistantMessage>,
  void
>;

export type InvokeFailure = LLMFailure | ParseFailure;

export type InvokeConfig = { llm: LLM; tools: Tool[] };

export const invoke: Invoke = (history, config) =>
  _invoke(
    config.llm({
      messages: history,
      tools: config.tools.map((it) => it.meta),
    }),
    [],
  );

async function* _invoke(
  inference: LLMResponse,
  chunks: LLMResponseChunk[],
): InvokeResult {
  const result = await inference.next();

  if (result.done) {
    return Either.isLeft(result.value)
      ? result.value
      : createAssistantMessage(chunks);
  }

  const content = result.value.choices[0]?.delta.content;

  if (content) {
    yield content;
  }

  return yield* _invoke(inference, [...chunks, result.value]);
}

type ParseFailure = Failure<'LLMBadResponse', string>;

function createAssistantMessage(
  chunks: LLMResponseChunk[],
): Either<ParseFailure, AssistantMessage> {
  const result = createRawAssistantMessage(chunks);

  if (Either.isLeft(result)) {
    return result;
  }

  return Either.right({
    role: 'assistant',
    content: result.value.content.join('') as AssistantContent,
    tool_calls: result.value.tool_calls.map((it) => ({
      id: createToolCallID(),
      type: 'function',
      function: {
        name: it.function.name,
        arguments: it.function.arguments.join('') as ToolArguments,
      },
    })),
  });
}

function createRawAssistantMessage(
  chunks: LLMResponseChunk[],
): Either<ParseFailure, RawAssistantMessage> {
  const [chunk, ...rest] = chunks;

  if (isNil(chunk)) {
    return Either.right({ content: [], tool_calls: [] });
  }

  const [choice] = chunk.choices;

  if (isNil(choice)) {
    return createRawAssistantMessage(rest);
  }

  if (isNil(choice.delta.tool_calls)) {
    const message = createRawAssistantMessage(rest);

    if (Either.isLeft(message)) {
      return message;
    }

    if (isNil(choice.delta.content)) {
      return Either.left({
        kind: 'LLMBadResponse',
        body: 'Expected to content to be defined',
      });
    }

    return Either.right({
      content: [choice.delta.content, ...message.value.content],
      tool_calls: message.value.tool_calls,
    });
  }

  const [call] = choice.delta.tool_calls;

  if (isNil(call)) {
    return Either.left({
      kind: 'LLMBadResponse',
      body: 'Expected for tool_calls not to be empty',
    });
  }

  if (isNil(call.function.name)) {
    return Either.left({
      kind: 'LLMBadResponse',
      body: 'Expected to receive function name',
    });
  }

  return createToolCall(
    {
      index: call.index,
      function: {
        name: call.function.name,
        arguments: [],
      },
    },
    rest,
  );
}

function createToolCall(
  call: RawToolCall,
  chunks: LLMResponseChunk[],
): Either<ParseFailure, RawAssistantMessage> {
  const [chunk, ...rest] = chunks;

  if (isNil(chunk)) {
    return Either.left({
      kind: 'LLMBadResponse',
      body: 'Unexpected chunks end',
    });
  }

  const fn = chunk.choices[0]?.delta.tool_calls?.[0];

  if (call.index !== fn?.index) {
    const message = createRawAssistantMessage(chunks);

    if (Either.isLeft(message)) {
      return message;
    }

    return Either.right({
      content: message.value.content,
      tool_calls: [call, ...message.value.tool_calls],
    });
  }

  if (isNil(fn.function.arguments)) {
    return Either.left({
      kind: 'LLMBadResponse',
      body: 'Expected to receive tool arguments',
    });
  }

  return createToolCall(
    {
      index: call.index,
      function: {
        name: call.function.name,
        arguments: [...call.function.arguments, fn.function.arguments],
      },
    },
    rest,
  );
}

type RawAssistantMessage = {
  content: AssistantContentChunk[];
  tool_calls: RawToolCall[];
};

type RawToolCall = {
  index: number;
  function: {
    name: ToolName;
    arguments: ToolArgumentsChunk[];
  };
};

let id = 0;

function createToolCallID(): ToolCallID {
  id += 1;

  return `${id}` as ToolCallID;
}
