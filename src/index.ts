import { z } from 'zod';
import { chat } from './chat';
import { AssistantContentChunk, openai } from './core/llm';
import { tool } from './core/tool';
import { createToolErrorFallback } from './createToolErrorFallback';
import { createToolsFactory } from './createToolsFactory';
import { loggable } from './loggable';
import { UserProvider } from './UserContext';

async function main() {
  return UserProvider(() => {
    const work = chat(
      {
        role: 'system',
        content:
          'You are forecast assistant who uses getWeather tool.' +
          'Use emojis to encourage user.',
      },
      {
        llm: loggable(openai, 'low'),
        tools: createToolsFactory([createToolErrorFallback(getWeather)]),
      },
    );

    return render(work);
  });
}

const getWeather = tool({
  name: 'getWeather',
  description: 'Get the weather for a given city',
  schema: z.object({ city: z.string() }),
  fn: async ({ city }) => `The weather in ${city} is always sunny!`,
});

void main();

async function render(
  stream: AsyncGenerator<AssistantContentChunk, unknown, void>,
) {
  let iter = await stream.next();
  while (!iter.done) {
    process.stdout.write(iter.value);

    iter = await stream.next();
  }

  console.log('EXIT REASON', iter.value);
}
