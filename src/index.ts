import { ChatOpenAI } from '@langchain/openai';
import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/streaming/overview
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
  });

  const stream = await agent.stream(
    { messages: [{ role: 'user', content: 'what is the weather in sf' }] },
    { streamMode: 'messages' },
  );

  for await (const [token, metadata] of stream) {
    console.log('metadata:', metadata.langgraph_node);
    console.log('content:', token.contentBlocks);
  }
}
