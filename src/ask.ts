import { createInterface } from 'node:readline/promises';
import { Either } from './misc/Either';
import { UserMessage } from './core/message';

export const ask = Either.fromAsyncThrowable(
  async (question: string): Promise<UserMessage> => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      return {
        role: 'user',
        content: await rl.question(`${question}\n`),
      };
    } finally {
      rl.close();
    }
  },
);
