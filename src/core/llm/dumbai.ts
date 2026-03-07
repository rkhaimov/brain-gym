import { Either } from '../../utils/Either';
import { AssistantContentChunk } from './response-chunk-types';
import { LLM } from './types';

export const dumbai: LLM = async function* () {
  yield {
    choices: [{ delta: { content: 'I am dumb AI.' as AssistantContentChunk } }],
  };

  return Either.right(undefined);
};
