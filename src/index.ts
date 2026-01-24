import { ChatOpenAI } from '@langchain/openai';
import { createAgent, HumanMessage, tool } from 'langchain';
import { CONFIGURATION } from './private';
import z from 'zod';

void main();

async function main() {
  const getTemperature = tool(
    ({ city }) => `In ${city} temperature is 21 degrees.`,
    {
      name: 'get_temperature',
      description: 'Get the temperature for a given city',
      schema: z.object({
        city: z.string().describe('A city where temperature must be measured'),
      }),
    },
  );

  const agent = createAgent({
    model: new ChatOpenAI(CONFIGURATION),
    tools: [getTemperature],
  });

  console.log(
    await agent.invoke({
      messages: [new HumanMessage("What's the temperature in New-York city?")],
    }),
  );
}
