import { createInterface } from 'node:readline/promises';
import { Either } from '../../utils/Either';
import { Failure } from '../../utils/Failure';

export type AskFailure = Failure<'ReadLineFailure', void>;

export const ask = async (): Promise<Either<AskFailure, string>> => {
  console.log('\n');

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    return Either.right(await rl.question(''));
  } catch (_) {
    return Either.left({ kind: 'ReadLineFailure', body: undefined });
  } finally {
    rl.close();
  }
};
