import { ChatOpenAI } from '@langchain/openai';
import { createSubAgentMiddleware } from 'deepagents';

import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/guardrails
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
    middleware: [
      createSubAgentMiddleware({
        defaultModel: model,
        subagents: [
          {
            name: 'weather',
            description: 'This subagent can get weather in cities.',
            systemPrompt:
              'Use the get_weather tool to get the weather in a city.',
            tools: [getWeather],
            model: 'gpt-4.1',
            middleware: [],
          },
        ],
      }),
    ],
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
