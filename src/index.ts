import { invoke } from './core/invoke';
import { openai } from './core/llm/openai';
import { render } from './render';

async function main() {
  const inference = invoke(
    [
      {
        role: 'user',
        content: 'Hello!',
      },
    ],
    {
      llm: openai,
      tools: [],
    },
  );

  return render(inference);
}

void main();
