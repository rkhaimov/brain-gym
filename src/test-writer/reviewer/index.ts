import { llm } from '@lib/llm/llm';
import { logged } from '@lib/llm/logged';
import { structured, StructuredFailure } from '@lib/llm/structured';
import { LLMResponseChunk } from '@lib/llm/types/response-chunk-types';
import { LLMState } from '@lib/LLMState';
import { Either } from '@utils/Either';
import { Stream } from '@utils/Stream';
import fs from 'node:fs';
import path from 'node:path';
import { Context, ContextSchema, Issues, IssuesSchema } from '../schemas';

export async function* reviewer(
  input: Context,
): Stream<LLMResponseChunk, Either<StructuredFailure, Issues>> {
  console.log('=== TEST REVIEWER ===');

  return Either.right([]);

  // const state = LLMState.create(createSystemPrompt()).advance({
  //   role: 'user',
  //   content: JSON.stringify(input),
  // });
  //
  // return yield* structured({
  //   llm: llm.thinking,
  //   messages: state.toNative(),
  //   schema: IssuesSchema,
  // });
}

function createSystemPrompt() {
  return fs
    .readFileSync(path.join(__dirname, 'system-prompt.md'))
    .toString()
    .replace('{ContextSchema}', JSON.stringify(ContextSchema.toJSONSchema()))
    .replace('{IssuesSchema}', JSON.stringify(IssuesSchema.toJSONSchema()));
}
