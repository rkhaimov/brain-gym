import { BaseMessageLike } from '@langchain/core/dist/messages/base';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import assert from 'node:assert';
import { z } from 'zod';
import { CONNECTION_CONFIG } from './private';

void main();

async function main() {
  const getWeather = tool((input) => `It's sunny in ${input.location} today.`, {
    name: 'get_weather',
    description: 'Get the weather at a location.',
    schema: z.object({
      location: z.string().describe('The location to get the weather for'),
    }),
  });

  const model = new ChatOpenAI(CONNECTION_CONFIG).bindTools([getWeather]);

  const input = [
    new SystemMessage(
      'You are an assistant who provides user with weather info',
    ),
    new HumanMessage('What is the weather like in Tokyo?'),
  ];

  const response = await model.invoke(input);

  const calls: BaseMessageLike[] = [];
  for (const call of response.tool_calls ?? []) {
    assert(call.name === 'get_weather');

    calls.push(await getWeather.invoke(call));
  }

  const result = await model.invoke([...input, response, ...calls]);

  console.log(result.text);
}
