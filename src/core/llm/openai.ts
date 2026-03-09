import { parseServerSentEvents } from 'parse-sse';
import { CONNECTION_CONFIG } from '../../private';
import { Either } from '../../utils/Either';
import { assert, assertNotEmpty } from '../../utils/utils';
import { LLM } from './types';

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
    return Either.left({ kind: 'LLMFailure', body: error });
  }
};
