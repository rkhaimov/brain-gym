import { ChatOpenAI } from '@langchain/openai';

import { createAgent, todoListMiddleware } from 'langchain';
import { CONNECTION_CONFIG } from './private';

const PROMPT = `## \`write_todos\`

You have access to the \`write_todos\` tool to help you manage and plan objectives. 
Use this tool to ensure that you are tracking each necessary step and giving the user visibility into your progress.
This tool is very helpful for planning objectives, and for breaking down these objectives into smaller steps.

It is critical that you mark todos as completed as soon as you are done with a step. Do not batch up multiple steps before marking them as completed.

## Important To-Do List Usage Notes to Remember
- The \`write_todos\` tool should never be called multiple times in parallel.
- Don't be afraid to revise the To-Do list as you go. New information may reveal new tasks that need to be done, or old tasks that are irrelevant.`;

void main();

// https://docs.langchain.com/oss/javascript/langchain/middleware/built-in#to-do-list
async function main() {
  const model = new ChatOpenAI(CONNECTION_CONFIG);

  const agent = createAgent({
    model: model,
    tools: [],
    middleware: [
      todoListMiddleware({
        systemPrompt: PROMPT,
      }),
    ],
  });

  const result = await agent.invoke({
    messages: [
      {
        role: 'user',
        content: 'How to cook a cake?',
      },
    ],
  });

  console.log(result);
}
