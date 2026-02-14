import { MemorySaver } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, createAgent, HumanMessage, SystemMessage } from 'langchain';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/short-term-memory
async function main() {
  const checkpointer = new MemorySaver();

  const agent = createAgent({
    model: new ChatOpenAI(CONNECTION_CONFIG),
    tools: [],
    checkpointer,
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
      ],
    },
    { streamMode: 'values', configurable: { thread_id: '1' } },
  );

  for await (const chunk of response) {
    console.log(chunk.messages.at(-1)?.text);
  }

  console.log('\n');
}
