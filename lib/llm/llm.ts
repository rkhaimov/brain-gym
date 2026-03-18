import { parseServerSentEvents } from 'parse-sse';
import { CONNECTION_CONFIG, models } from '../../../private';
import { Either } from '@utils/Either';
import { toMessage } from './toMessage';
import { LLMResponseChunk } from './types/response-chunk-types';
import { LLM } from './types/types';

export const llm = {
  fast: createLLM(models[0]),
  thinking: createLLM(models[1]),
  large: createLLM(models[2]),
  small: createLLM(models[3]),
  gpt: createLLM(models[4]),
};

function createLLM(model: string): LLM {
  return retried(async function* (body) {
    try {
      const result = await fetch(
        `${CONNECTION_CONFIG.configuration.baseURL}/chat/completions`,
        {
          method: 'POST',
          body: JSON.stringify({
            model,
            stream: true,
            ...body,
          }),
          headers: [
            CONNECTION_CONFIG.configuration.auth,
            ['Content-Type', 'application/json'],
          ],
        },
      );

      if (!result.ok) {
        throw new Error(result.statusText);
      }

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
  });
}

function retried(llm: LLM): LLM {
  return async function* (body) {
    let retries = 0;

    while (true) {
      const result = yield* llm(body);

      if (Either.isRight(result) || retries === 3) {
        return result;
      }

      retries += 1;

      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  };
}
