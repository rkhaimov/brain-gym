import { LLM } from './types';

export function logged(llm: LLM): LLM {
  return (body) => {
    console.log('\nLLM called with', JSON.stringify(body, null, 2));

    return llm(body);
  };
}
