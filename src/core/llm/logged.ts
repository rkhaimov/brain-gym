import { LLM } from './types/types';

export function logged(llm: LLM): LLM {
  return async function* (body) {
    console.log('\nLLM called with', JSON.stringify(body, null, 2));

    const result = yield* llm(body);

    console.log('\nLLM responded with', JSON.stringify(result, null, 2));

    return result;
  };
}
