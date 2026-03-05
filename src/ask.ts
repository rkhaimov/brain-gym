import { createInterface } from 'node:readline/promises';
import { UserMessage } from './core/message';
import { Either } from './misc/Either';
import { Failure } from './misc/failure';
import { Task } from './misc/Task';

export type AskFailure = Failure<'ReadLineFailure', void>;

export const ask = async (question: string): Task<AskFailure, UserMessage> => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    return Either.right({
      role: 'user',
      content: await rl.question(`${question}\n`),
    });
  } catch (_) {
    return Either.left({ kind: 'ReadLineFailure', body: undefined });
  } finally {
    rl.close();
  }
};
