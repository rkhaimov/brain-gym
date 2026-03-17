import { logged } from './core/llm/logged';
import { openai } from './core/llm/openai';
import { LLMState } from './core/LLMState';
import { Tool } from './core/tool';
import { render } from './render';
import { Skills } from './Skills';
import { Either } from './utils/Either';

// https://docs.langchain.com/oss/javascript/deepagents/data-analysis
async function main() {
  return render(
    run(
      'Write a SQL query to find all customers who made orders over $1000 in the last month',
    ),
  );
}

async function* run(question: string) {
  let state = LLMState.create(
    `
  You are a SQL query assistant that helps users write queries against business databases.
  
  ${Skills.system}
  `,
  ).advance({
    role: 'user',
    content: question,
  });

  while (true) {
    const inference = yield* logged(openai)({
      messages: state.toHistory(),
      tools: [Skills.tool.meta],
    });

    if (Either.isLeft(inference)) {
      return inference;
    }

    if (inference.value.tool_calls.length === 0) {
      return;
    }

    const ran = await Tool.all(inference.value, [Skills.tool]);

    state = state.advance(inference.value, ...ran);
  }
}

void main();
