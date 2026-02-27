import { SqlDatabase } from '@langchain/classic/sql_db';
import { ChatOpenAI } from '@langchain/openai';
import {
  createAgent,
  createMiddleware,
  tool,
  SystemMessage,
  HumanMessage,
} from 'langchain';
import * as path from 'node:path';
import { DataSource } from 'typeorm';
import { z } from 'zod';
import { CONNECTION_CONFIG } from './private';

// https://docs.langchain.com/oss/javascript/langgraph/agentic-rag
async function main() {
  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: new DataSource({
      type: 'sqlite',
      database: path.resolve('./Chinook.db'),
    }),
  });

  const agent = createAgent({
    model: new ChatOpenAI(CONNECTION_CONFIG),
    systemPrompt: new SystemMessage(`You are a careful SQLite analyst.
    Authoritative schema (do not invent columns/tables):
    ${await db.getTableInfo()}
    
    Rules:
    - Think step-by-step.
    - When you need data, call the tool \`execute_sql\` with ONE SELECT query.
    - Read-only only; no INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE.
    - Limit to 5 rows unless user explicitly asks otherwise.
    - If the tool returns 'Error:', revise the SQL and try again.
    - Limit the number of attempts to 5.
    - If you are not successful after 5 attempts, return a note to the user.
    - Prefer explicit column lists; avoid SELECT *.
    `),
    tools: [
      tool(
        async (arg) => {
          const query = (arg as unknown as Record<string, string>).query;

          return await db.run(query);
        },
        {
          name: 'execute_sql',
          description:
            'Execute a READ-ONLY SQLite SELECT query and return results.',
          schema: z.object({
            query: z
              .string()
              .describe('SQLite SELECT query to execute (read-only).'),
          }),
        },
      ),
    ],
    middleware: [
      createMiddleware({
        name: 'debug',
        beforeModel: (state, runtime) => {
          debugger;

          return state;
        },
        afterModel: (state, runtime) => {
          debugger;

          return state;
        },
      }),
    ],
  });

  const result = await agent.invoke({
    messages: [
      new HumanMessage('Which genre, on average, has the longest tracks?'),
    ],
  });

  console.log(result.messages);
}

void main();
