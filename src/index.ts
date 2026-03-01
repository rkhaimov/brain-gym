import { z } from 'zod';
import { chat } from './chat';
import { openai } from './core/llm';
import { Either } from './misc/Either';
import { assert } from './misc/utils';
import { tool } from './core/tool';

async function main() {
  const result = await chat(
    {
      role: 'system',
      content:
        'You are forecast assistant who uses getWeather tool.' +
        'Use emojis to encourage user.',
    },
    {
      llm: openai,
      tools: [getWeather],
    },
  );

  assert(Either.isLeft(result));

  console.log(result.value);
}

const getWeather = tool({
  name: 'getWeather',
  description: 'Get the weather for a given city',
  schema: z.object({ city: z.string() }),
  fn: async ({ city }) => `It is always sunny in ${city}`,
});

void main();
