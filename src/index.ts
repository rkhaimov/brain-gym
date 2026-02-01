import { ChatOpenAI } from '@langchain/openai';
import { createAgent, HumanMessage, tool } from 'langchain';
import { BuiltInState } from 'langchain/dist/agents/types';
import z from 'zod';
import { createRL } from './createRL';
import { createTodoStorage } from './createTodoStorage';
import { CONNECTION_CONFIG } from './private';

void main();

async function main() {
  const rl = createRL();
  const todo = createTodoStorage();

  const systemPrompt = `You are an expert assistance who helps to manage things to do`;

  const getAllTodos = tool(async () => JSON.stringify(await todo.getAll()), {
    name: 'get_all_todos',
    description: 'Get all planned todos. List all of them as numbered list',
  });

  const createTodo = tool(
    ({ content }) => JSON.stringify(todo.create(content)),
    {
      name: 'create_todo',
      description: 'Create a new todo',
      schema: z.object({
        content: z
          .string()
          .describe('Contains information about what must be done'),
      }),
    },
  );

  const completeTodo = tool(({ id }) => JSON.stringify(todo.complete(id)), {
    name: 'complete_todo',
    description: 'Complete a todo',
    schema: z.object({
      id: z.number().describe('ID of a todo to be marked as completed'),
    }),
  });

  const model = new ChatOpenAI(CONNECTION_CONFIG);

  const agent = createAgent({
    model,
    systemPrompt,
    tools: [getAllTodos, createTodo, completeTodo],
  });

  // Short-term memory is kept small with the help of external tools
  while (true) {
    // Output state to a user
    const state = await agent.invoke({
      messages: [new HumanMessage('List me things that must be done')],
    });

    // User asks for an action
    const prompt = await rl.ask(state.messages.at(-1)!.content as string);

    state.messages.push(new HumanMessage(prompt));

    // Perform an action and repeat
    await agent.invoke(state);

    /**
     * It looks very much like standard UI behaviour:
     * * We have a "screen" where data is displayed
     * * We perform an action and screen is just being updated
     * * LLM allows to implement human-readable text interface instead of standard controls like buttons and etc.
     */
    console.clear();
  }
}
