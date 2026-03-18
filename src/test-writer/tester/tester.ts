import { llm } from '@lib/llm/llm';
import { structured, StructuredFailure } from '@lib/llm/structured';
import { LLMResponseChunk } from '@lib/llm/types/response-chunk-types';
import { LLMState } from '@lib/LLMState';
import { Either } from '@utils/Either';
import { Stream } from '@utils/Stream';
import fs from 'node:fs';
import path from 'node:path';
import {
  Requirements,
  RequirementsSchema,
} from '../../requirements-creator/schemas';
import { Tests, TestsSchema } from '../schemas';

export async function* tester(
  requirements: Requirements,
): Stream<LLMResponseChunk, Either<StructuredFailure, Tests>> {
  console.log('=== TESTER ===');

  const state = LLMState.create(createSystemPrompt()).advance({
    role: 'user',
    content: JSON.stringify(requirements),
  });

  return yield* structured({
    llm: llm.fast,
    messages: state.toNative(),
    schema: TestsSchema,
  });
}

function createSystemPrompt() {
  return fs
    .readFileSync(path.join(__dirname, 'system-prompt.md'))
    .toString()
    .replace(
      '{RequirementsSchema}',
      JSON.stringify(RequirementsSchema.toJSONSchema()),
    )
    .replace('{TestsSchema}', JSON.stringify(TestsSchema.toJSONSchema()));
}
