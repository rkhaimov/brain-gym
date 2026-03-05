import { z } from 'zod';
import { chat } from './chat';
import { openai } from './core/llm';
import { tool } from './core/tool';
import { createLLMEmulatedTool } from './createLLMEmulatedTool';
import { Either } from './misc/Either';
import { assert } from './misc/utils';

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
      tools: [createLLMEmulatedTool(getWeather, openai)],
    },
  );

  assert(Either.isLeft(result));

  if (result.value.kind === 'ReadLineFailure') {
    process.exit();
  }

  console.log(JSON.stringify(result, null, 2));
}

const getWeather = tool({
  name: 'getWeather',
  description: 'Get the weather for a given city',
  schema: z.object({ city: z.string() }),
  fn: async ({ city }) => `It is always sunny in ${city}`,
});

void main();
