import { Calculator } from '@langchain/community/tools/calculator';
import { ChatOpenAI } from '@langchain/openai';

import { createAgent, llmToolSelectorMiddleware, tool } from 'langchain';
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

  const calculator = new Calculator();

  const agent = createAgent({
    model: model,
    tools: [calculator, getWeather],
    middleware: [llmToolSelectorMiddleware({ model: model })],
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
