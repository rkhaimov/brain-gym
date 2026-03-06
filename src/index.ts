import { z } from 'zod';
import { chat } from './chat';
import { AssistantContentChunk, dumbai } from './core/llm';
import { tool } from './core/tool';
import { createHITLTool } from './createHITLTool';
import { createLLMEmulatedTool } from './createLLMEmulatedTool';
import { UserProvider } from './UserContext';

async function main() {
  const work = chat(
    {
      role: 'system',
      content:
        'You are forecast assistant who uses getWeather tool.' +
        'Use emojis to encourage user.',
    },
    {
      llm: dumbai,
      tools: [createHITLTool(createLLMEmulatedTool(getWeather, dumbai))],
    },
  );

  return UserProvider(() => render(work));
}

const getWeather = tool({
  name: 'getWeather',
  description: 'Get the weather for a given city',
  schema: z.object({ city: z.string() }),
  fn: async ({ city }) => `It is always sunny in ${city}`,
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
