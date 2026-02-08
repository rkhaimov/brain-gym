import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { CONNECTION_CONFIG } from './private';

void main();

// https://docs.langchain.com/oss/javascript/langchain/models#advanced-topics
async function main() {
  const model = new ChatOpenAI({ ...CONNECTION_CONFIG, maxTokens: 100 });

  const response = await model.stream([
    new SystemMessage(`
          You are an assistant who draws request objects as ascii images.
          
          * You must output picture only.
          * You can't use emoji's.
          * You must not use markdown specific elements.
          * You are working in restricted CLI env.
        `),
    new HumanMessage('Draw a frog'),
  ]);

  for await (const chunk of response) {
    process.stdout.write(chunk.text);
  }

  console.log('\n');
}
