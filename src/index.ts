import { ChatOpenAI } from '@langchain/openai';
import { createAgent, HumanMessage, SystemMessage, tool } from 'langchain';
import { z } from 'zod';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/models#advanced-topics
async function main() {
  const searchDatabase = tool(
    (args) => {
      console.log(args);

      return `Found 42 results in total.`;
    },
    {
      name: 'search_database',
      description:
        'Search the customer database for records matching the query.',
      schema: z.object({
        query: z.string().describe('Search terms to look for'),
        limit: z.number().describe('Maximum number of results to return'),
      }),
    },
  );

  const agent = createAgent({
    model: new ChatOpenAI(CONNECTION_CONFIG),
    tools: [searchDatabase],
  });

  const response = await agent.stream(
    {
      messages: [
        new SystemMessage(
          'You are an assistant who helps to count customers matching certain criteria.',
        ),
        new HumanMessage('How many customers have bought hats in last month?'),
      ],
    },
    { streamMode: 'values' },
  );

  for await (const chunk of response) {
    console.log(chunk.messages.at(-1)?.text);
  }

  console.log('\n');
}
