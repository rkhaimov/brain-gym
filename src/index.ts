import { RemoveMessage } from '@langchain/core/messages';
import { REMOVE_ALL_MESSAGES } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import {
  AIMessage,
  createAgent,
  createMiddleware,
  HumanMessage,
  SystemMessage,
} from 'langchain';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/short-term-memory
async function main() {
  // The problem with trimming or removing messages is that you may lose information from culling of the message queue.
  const agent = createAgent({
    model: new ChatOpenAI(CONNECTION_CONFIG),
    tools: [],
    middleware: [
      createMiddleware({
        name: 'TrimMessages',
        beforeModel: (state) => {
          const messages = state.messages;

          if (messages.length < 5) {
            return; // No changes needed
          }

          return {
            messages: [
              new RemoveMessage({ id: REMOVE_ALL_MESSAGES }),
              messages[0],
              ...messages.slice(-3),
            ],
          };
        },
      }),
    ],
  });

  const response = await agent.stream(
    {
      messages: [
        new SystemMessage(
          'You are a calculator that outputs results of elementary operations.',
        ),
        new HumanMessage('2+3'),
        new AIMessage('5'),
        new HumanMessage('5*3'),
        new AIMessage('15'),
        new HumanMessage('10*5'),
      ],
    },
    { streamMode: 'values', configurable: { thread_id: '1' } },
  );

  for await (const chunk of response) {
    console.log(chunk.messages.at(-1)?.text);
  }

  console.log('\n');
}
