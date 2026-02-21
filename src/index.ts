import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain';

import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/guardrails
async function main() {
  const client = new MultiServerMCPClient({
    weather: {
      transport: 'stdio',
      command: 'npx ts-node ./getWeather.ts',
      args: [],
    },
  });

  const agent = createAgent({
    model: new ChatOpenAI(CONNECTION_CONFIG),
    tools: await client.getTools(),
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
