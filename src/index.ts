import { ChatOpenAI } from '@langchain/openai';
import {
  AIMessage,
  createAgent,
  HumanMessage,
  summarizationMiddleware,
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
      summarizationMiddleware({
        model: new ChatOpenAI(CONNECTION_CONFIG),
        trigger: { messages: 2 },
        keep: { messages: 2 },
      }),
    ],
  });

  const response = await agent.invoke({
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
  });

  console.log(response.messages.at(-1)?.text);
}
