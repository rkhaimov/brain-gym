import { Either } from '../misc/Either';
import { AssistantMessage, Message, ToolMeta } from './message';
import { assert } from '../misc/utils';
import { CONNECTION_CONFIG } from '../private';

export type LLM = typeof openai;

export const openai = Either.fromAsyncThrowable(
  async (body: LLMBody): Promise<LLMResponse> => {
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

    return result.json();
  },
);

type LLMBody = {
  tools: ToolMeta[];
  messages: Message[];
};

type LLMResponse = {
  choices: Array<{
    message: AssistantMessage;
  }>;
};
