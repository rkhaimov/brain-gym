import { llm } from '@lib/llm/llm';
import { logged } from '@lib/llm/logged';
import { structured, StructuredFailure } from '@lib/llm/structured';
import { LLMResponseChunk } from '@lib/llm/types/response-chunk-types';
import { LLMState } from '@lib/LLMState';
import { Either } from '@utils/Either';
import { Stream } from '@utils/Stream';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { ContextSchema, IssuesSchema, Tests, TestsSchema } from '../schemas';

export type ProblematicTests = z.Infer<typeof ProblematicTestsSchema>;

export async function* fixer(
  meta: ProblematicTests,
): Stream<LLMResponseChunk, Either<StructuredFailure, Tests>> {
  console.log('=== TEST FIXER ===');

  const state = LLMState.create(createSystemPrompt()).advance({
    role: 'user',
    content: JSON.stringify(meta),
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
      '{ProblematicTestsSchema}',
      JSON.stringify(ProblematicTestsSchema.toJSONSchema()),
    )
    .replace('{TestsSchema}', JSON.stringify(TestsSchema.toJSONSchema()));
}

const ProblematicTestsSchema = z.object({
  issues: IssuesSchema.describe('Issues to fix'),
  context: ContextSchema,
});
