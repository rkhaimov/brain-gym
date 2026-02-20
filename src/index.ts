import { ChatOpenAI } from '@langchain/openai';
import { createFilesystemMiddleware } from 'deepagents';

import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import { CONNECTION_CONFIG } from './private';

void main();

async function main() {
  const model = new ChatOpenAI(CONNECTION_CONFIG);

  const getWeather = tool(
    (args) => `The weather in ${args.city} is always sunny!`,
    {
      name: 'get_weather',
      description: 'Get weather for a given city.',
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  debugger;
  const agent = createAgent({
    model: model,
    tools: [getWeather],
    middleware: [createFilesystemMiddleware()],
  });

  const result = await agent.invoke({
    messages: [
      {
        role: 'user',
        content: 'What is the weather in SF?',
      },
    ],
  });

  console.log(result);
}
