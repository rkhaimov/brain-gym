import { MemorySaver } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';

import { createAgent, piiMiddleware } from 'langchain';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/middleware/built-in#to-do-list
async function main() {
  const model = new ChatOpenAI(CONNECTION_CONFIG);

  const agent = createAgent({
    model: model,
    tools: [],
    checkpointer: new MemorySaver(),
    middleware: [
      piiMiddleware('email', { strategy: 'redact', applyToInput: true }),
    ],
  });

  const result = await agent.invoke(
    {
      messages: [
        {
          role: 'user',
          content: 'hello my email is hello@email.com',
        },
      ],
    },
    { configurable: { thread_id: '1' } },
  );

  console.log(result);
}
