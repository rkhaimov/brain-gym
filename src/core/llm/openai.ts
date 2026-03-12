import { parseServerSentEvents } from 'parse-sse';
import { CONNECTION_CONFIG } from '../../private';
import { Either } from '../../utils/Either';
import { assert, assertNotEmpty } from '../../utils/utils';
import { toMessage } from './toMessage';
import { LLMResponseChunk } from './types/response-chunk-types';
import { LLM } from './types/types';

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

    const chunks: LLMResponseChunk[] = [];
    for await (const event of parseServerSentEvents(result)) {
      if (event.data === '[DONE]') {
        continue;
      }

      const chunk: LLMResponseChunk = JSON.parse(event.data);

      chunks.push(chunk);

      yield chunk;
    }

    return toMessage(chunks);
  } catch (error: unknown) {
    return Either.left({ kind: 'UnknownLLMFailure', body: error });
  }
};
