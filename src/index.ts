import {
  AIMessage,
  AIMessageChunk,
  BaseMessageLike,
  SystemMessage,
} from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from 'langchain';
import { createRL } from './createRL';
import { CONNECTION_CONFIG } from './private';

const rl = createRL();

void main();

async function main() {
  const model = new ChatOpenAI(CONNECTION_CONFIG);

  await chat(model, [new HumanMessage('Hello')]);
}

async function chat(model: ChatOpenAI, messages: BaseMessageLike[]) {
  const stream = await model.stream(messages);

  let full = new AIMessageChunk([]);
  for await (const chunk of stream) {
    full = full.concat(chunk);
  }

  const prompt = await rl.ask(full.text);

  console.log('\n');

  return chat(model, [...messages, full, new HumanMessage(prompt)]);
}
