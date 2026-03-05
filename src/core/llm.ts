import { Either } from '../misc/Either';
import { Failure } from '../misc/failure';
import { Task } from '../misc/Task';
import { assert } from '../misc/utils';
import { CONNECTION_CONFIG } from '../private';
import { AssistantMessage, Message, ToolMeta } from './message';

export type LLM = (body: LLMBody) => Task<LLMFailure, LLMResponse>;

export type LLMFailure = Failure<'LLMRequestFailure', unknown>;

export const openai: LLM = async (body) => {
  try {
    const result = await fetch(
      `${CONNECTION_CONFIG.configuration.baseURL}/chat/completions`,
      {
        method: 'POST',
        body: JSON.stringify({
          model: CONNECTION_CONFIG.model,
          stream: false,
          ...body,
        }),
        headers: [
          CONNECTION_CONFIG.configuration.auth,
          ['Content-Type', 'application/json'],
        ],
      },
    );

    assert(result.ok, result.statusText);

    return Either.right(await result.json());
  } catch (error: unknown) {
    return Either.left({ kind: 'LLMRequestFailure', body: error });
  }
};

type LLMBody = {
  tools: ToolMeta[];
  messages: Message[];
};

type LLMResponse = {
  choices: Array<{
    message: AssistantMessage;
  }>;
};
