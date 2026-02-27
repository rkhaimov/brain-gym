import { ChatOpenAI } from '@langchain/openai';
import { createDeepAgent } from 'deepagents';
import { createMiddleware, tool } from 'langchain';
import { z } from 'zod';
import { CONNECTION_CONFIG } from './private';

// https://docs.langchain.com/oss/javascript/deepagents/overview
async function main() {
  const getWeather = tool(({ city }) => `It's always sunny in ${city}!`, {
    name: 'get_weather',
    description: 'Get the weather for a given city',
    schema: z.object({
      city: z.string(),
    }),
  });

  const agent = createDeepAgent({
    model: new ChatOpenAI(CONNECTION_CONFIG),
    systemPrompt: 'You are a helpful assistant',
    tools: [getWeather],
    middleware: [
      createMiddleware({
        name: 'debug',
        wrapModelCall: (request, handler) => {
          debugger;

          return handler(request);
        },
      }),
    ],
  });

  console.log(
    await agent.invoke({
      messages: [{ role: 'user', content: "What's the weather in Tokyo?" }],
    }),
  );
}

void main();
