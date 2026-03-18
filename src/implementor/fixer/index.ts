import { llm } from '@lib/llm/llm';
import { structured, StructuredFailure } from '@lib/llm/structured';
import { LLMResponseChunk } from '@lib/llm/types/response-chunk-types';
import { LLMState } from '@lib/LLMState';
import { Either } from '@utils/Either';
import { Stream } from '@utils/Stream';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { RequirementsSchema } from '../../requirements-creator/schemas';
import {
  CheckFailureBodySchema,
  Implementation,
  ImplementationSchema,
} from '../schemas';

export async function* fixer(
  meta: ProblematicImplementation,
): Stream<LLMResponseChunk, Either<StructuredFailure, Implementation>> {
  const state = LLMState.create(createSystemPrompt()).advance({
    role: 'user',
    content: JSON.stringify(meta),
  });

  return yield* structured({
    llm: llm.fast,
    messages: state.toNative(),
    schema: ImplementationSchema,
  });
}

function createSystemPrompt() {
  return fs
    .readFileSync(path.join(__dirname, 'system-prompt.md'))
    .toString()
    .replace(
      '{ProblematicImplementationSchema}',
      JSON.stringify(ProblematicImplementationSchema.toJSONSchema()),
    )
    .replace(
      '{ImplementationSchema}',
      JSON.stringify(ImplementationSchema.toJSONSchema()),
    );
}

const ProblematicImplementationSchema = z.object({
  requirements: RequirementsSchema,
  failure: CheckFailureBodySchema,
});

type ProblematicImplementation = z.Infer<
  typeof ProblematicImplementationSchema
>;
