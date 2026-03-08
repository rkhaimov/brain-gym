import { Either } from '../../utils/Either';
import { LLM } from './types';

export const dumbai: LLM = async function* () {
  yield {
    choices: [{ delta: { content: 'I am dumb AI.' } }],
  };

  return Either.right(undefined);
};
