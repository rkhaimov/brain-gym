import { createInterface } from 'node:readline/promises';
import { UserMessage } from './core/message';
import { Either } from './misc/Either';
import { Failure } from './misc/failure';

export type AskFailure = Failure<'ReadLineFailure', void>;

export const ask = async (): Promise<Either<AskFailure, UserMessage>> => {
  console.log('\n');

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    return Either.right({
      role: 'user',
      content: await rl.question(''),
    });
  } catch (_) {
    return Either.left({ kind: 'ReadLineFailure', body: undefined });
  } finally {
    rl.close();
  }
};
