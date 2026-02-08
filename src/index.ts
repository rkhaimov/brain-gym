import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent, HumanMessage, SystemMessage } from 'langchain';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/short-term-memory
async function main() {
  const wiki = new WikipediaQueryRun({
    topKResults: 3,
    maxDocContentLength: 4_000,
  });

  const agent = createAgent({
    model: new ChatOpenAI(CONNECTION_CONFIG),
    tools: [wiki],
  });

  const response = await agent.stream(
    {
      messages: [
        new SystemMessage(
          'You are an assistant who tells people about places.',
        ),
        new HumanMessage('Could you tell me about New-York?'),
      ],
    },
    { streamMode: 'values' },
  );

  for await (const chunk of response) {
    console.log(chunk.messages.at(-1)?.text);
  }

  console.log('\n');
}
