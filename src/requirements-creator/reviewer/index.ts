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

// TODO: Use adversarial model
export async function* reviewer(
  requirements: Context,
): Stream<LLMResponseChunk, Either<StructuredFailure, Issues>> {
  console.log('=== REQUIREMENTS REVIEWER ===');

  return Either.right([]);

  // const state = LLMState.create(createSystemPrompt()).advance({
  //   role: 'user',
  //   content: JSON.stringify(requirements),
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
    .replace(
      '{TraceableRequirementsSchema}',
      JSON.stringify(ContextSchema.toJSONSchema()),
    )
    .replace('{IssuesSchema}', JSON.stringify(IssuesSchema.toJSONSchema()));
}
