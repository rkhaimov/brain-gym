import { LLM } from './core/llm';

export function loggable(llm: LLM, verbosity: 'low' | 'high'): LLM {
  return (body) => {
    console.log(
      'LLM called with',
      JSON.stringify(
        {
          ...body,
          tools:
            verbosity === 'low'
              ? body.tools.map((it) => it.function.name)
              : body.tools,
        },
        null,
        2,
      ),
    );

    return llm(body);
  };
}
