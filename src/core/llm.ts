import { parseServerSentEvents } from 'parse-sse';
import { Either } from '../misc/Either';
import { Failure } from '../misc/failure';
import { assert, assertNotEmpty, Brand } from '../misc/utils';
import { CONNECTION_CONFIG } from '../private';
import { Message, ToolMeta, ToolName } from './message';

export const dumbai: LLM = async function* () {
  yield {
    choices: [{ delta: { content: 'I am dumb AI.' as AssistantContentChunk } }],
  };

  return Either.right(undefined);
};

export const openai: LLM = async function* (body) {
  try {
    const result = await fetch(
      `${CONNECTION_CONFIG.configuration.baseURL}/chat/completions`,
      {
        method: 'POST',
        body: JSON.stringify({
          model: CONNECTION_CONFIG.model,
          stream: true,
          ...body,
        }),
        headers: [
          CONNECTION_CONFIG.configuration.auth,
          ['Content-Type', 'application/json'],
        ],
      },
    );

    assert(result.ok, result.statusText);
    assertNotEmpty(result.body);

    for await (const event of parseServerSentEvents(result)) {
      if (event.data === '[DONE]') {
        continue;
      }

      yield JSON.parse(event.data);
    }

    return Either.right(undefined);
  } catch (error: unknown) {
    return Either.left({ kind: 'LLMRequestFailure', body: error });
  }
};

export type LLM = (body: LLMBody) => LLMResponse;

export type LLMResponse = AsyncGenerator<
  LLMResponseChunk,
  Either<LLMFailure, void>,
  void
>;

export type LLMFailure = Failure<'LLMRequestFailure', unknown>;

export type AssistantContentChunk = Brand<string, 'AssistantContentChunk'>;

type LLMBody = {
  tools: ToolMeta[];
  messages: Message[];
};

export type LLMResponseChunk = { choices: LLMChoiceChunk[] };

type LLMChoiceChunk = {
  delta: {
    content?: AssistantContentChunk;
    tool_calls?: ToolCallChunk[];
  };
};

type ToolCallChunk = {
  index: number;
  function: {
    name?: ToolName;
    arguments?: ToolArgumentsChunk;
  };
};

export type ToolArgumentsChunk = Brand<string, 'ToolArgumentsChunk'>;
