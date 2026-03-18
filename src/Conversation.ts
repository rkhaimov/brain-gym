import { AssistantMessage } from '@lib/llm/types/message-types';
import { ToolMessage } from '@lib/llm/types/tool-types';
import { LLMState } from '@lib/LLMState';
import { tool } from '@lib/tool/tool';
import { createInterface } from 'node:readline/promises';
import { z } from 'zod';
import { emulated } from './emulated';

const ask = emulated(
  tool({
    name: 'ask',
    description: 'Get answer on given question',
    schema: z.object({ question: z.string() }),
    fn: async (args): Promise<ToolMessage> => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      try {
        const content = await rl.question(`${args.question}\n`);

        console.log('\n');

        return {
          role: 'tool',
          name: ask.meta.function.name,
          content,
        };
      } finally {
        rl.close();
      }
    },
  }),
);

export const Conversation = {
  tool: ask,
  fromQuery: (query: string): Conversation => {
    return [
      {
        role: 'user',
        content: query,
      },
    ];
  },
  /**
   * Create extracts the latest paired exchanges from the current LLM state.
   */
  fromState: (state: LLMState): Conversation => {
    return state.toNative().flatMap((message): Conversation => {
      switch (message.role) {
        case 'system':
        case 'developer':
        case 'user':
          return [];
        case 'assistant': {
          return message.tool_calls
            .filter((it) => it.function.name === ask.meta.function.name)
            .map(
              (it): AssistantMessage => ({
                role: 'assistant',
                content: JSON.parse(it.function.arguments).question,
                tool_calls: [],
              }),
            );
        }
        case 'tool': {
          const asked = message.name === ask.meta.function.name;

          if (asked) {
            return [{ role: 'user', content: message.content }];
          }

          return [];
        }
      }
    });
  },
  /**
   * Merge combines two conversation segments into a single history.
   */
  merge: (left: Conversation, right: Conversation): Conversation => {
    return [...left, ...right];
  },
};

/**
 * Conversation is a history of user queries, agent questions, and the user's answers to them.
 */
export type Conversation = z.Infer<typeof ConversationSchema>;

export const ConversationSchema = z
  .array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
  )
  .describe('Represents conversation history between user and assistant');
