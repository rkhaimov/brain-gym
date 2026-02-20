import { ChatOpenAI } from '@langchain/openai';
import { createFilesystemMiddleware, FilesystemBackend } from 'deepagents';

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

  debugger;
  const agent = createAgent({
    model: model,
    tools: [getWeather],
    middleware: [
      createFilesystemMiddleware({
        backend: new FilesystemBackend({ rootDir: process.cwd() }),
      }),
    ],
  });

  const result = await agent.invoke({
    messages: [
      {
        role: 'user',
        content:
          'Fix error in ./main.js file. Do not use ls. Directly work with a file.',
      },
    ],
  });

  console.log(result);
}
