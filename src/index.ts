import { BaseMessageLike } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from 'langchain';
import assert from 'node:assert';
import { createRL } from './createRL';
import { CONNECTION_CONFIG } from './private';

const rl = createRL();

void main();

async function main() {
  const model = new ChatOpenAI(CONNECTION_CONFIG);

  await chat(model, [new HumanMessage('Hello')]);
}

async function chat(model: ChatOpenAI, messages: BaseMessageLike[]) {
  const answer = await model.invoke(messages);

  assert(typeof answer.content === 'string');

  const prompt = await rl.ask(answer.content);

  return chat(model, [...messages, answer, new HumanMessage(prompt)]);
}
