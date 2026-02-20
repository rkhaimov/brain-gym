import { ChatOpenAI } from '@langchain/openai';
import { createFilesystemMiddleware, LocalShellBackend } from 'deepagents';

import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/middleware/built-in#filesystem-middleware
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

  const agent = createAgent({
    model: model,
    tools: [getWeather],
    middleware: [
      createFilesystemMiddleware({
        backend: new LocalShellBackend({ rootDir: process.cwd() }),
      }),
    ],
  });

  const result = await agent.invoke({
    messages: [
      {
        role: 'user',
        content: `Create node js script that outputs number of cpu cores on local computer.
           File must be named getCoresNumber.js.
           Execute it and print results.
           
           Use paths relative to cwd (./) only
          `,
      },
    ],
  });

  console.log(result);
}
