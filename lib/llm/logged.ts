import { LLM } from './types/types';

export function logged(llm: LLM): LLM {
  return async function* (body) {
    console.log(
      '\nLLM called with',
      JSON.stringify(body.messages.slice(1), null, 2),
    );

    console.log(
      '\nTools',
      JSON.stringify(
        body.tools?.map((it) => ({
          name: it.function.name,
          description: it.function.description,
        })),
        null,
        2,
      ),
    );

    const result = yield* llm(body);

    console.log('\nLLM responded with', JSON.stringify(result.value, null, 2));

    return result;
  };
}
