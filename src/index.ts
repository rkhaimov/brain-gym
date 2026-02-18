import { Command, MemorySaver } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';

import { createAgent, humanInTheLoopMiddleware, tool } from 'langchain';
import { z } from 'zod';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/middleware/built-in
async function main() {
  const getWeather = tool(
    async ({ city }) => {
      return `The weather in ${city} is always sunny!`;
    },
    {
      name: 'get_weather',
      description: 'Get weather for a given city.',
      schema: z.object({
        city: z.string(),
      }),
    },
  );

  const model = new ChatOpenAI(CONNECTION_CONFIG);

  const agent = createAgent({
    model: model,
    tools: [getWeather],
    checkpointer: new MemorySaver(),
    middleware: [
      humanInTheLoopMiddleware({
        interruptOn: {
          ['get_weather']: {
            allowedDecisions: ['approve', 'edit', 'reject'],
            description: '🚨 weather reading requires administrator approval',
          },
        },
      }),
    ],
  });

  await agent.invoke(
    {
      messages: [
        {
          role: 'user',
          content: 'what is the weather in sf',
        },
      ],
    },
    { configurable: { thread_id: '1' } },
  );

  const result = await agent.invoke(
    new Command({
      resume: {
        decisions: [
          {
            type: 'reject',
            message: 'I am sorry, I want to know weather in New York instead',
          },
        ],
      },
    }),
    { configurable: { thread_id: '1' } },
  );

  console.log(result);
}
