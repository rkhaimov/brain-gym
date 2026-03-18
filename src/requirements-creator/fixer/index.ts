import { interactive } from '@lib/llm/interactive';
import { llm } from '@lib/llm/llm';
import { logged } from '@lib/llm/logged';
import { LLMResponseChunk } from '@lib/llm/types/response-chunk-types';
import { LLMFailure } from '@lib/llm/types/types';
import { Either } from '@utils/Either';
import { Stream } from '@utils/Stream';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { Conversation } from '../../Conversation';
import {
  ContextSchema,
  IssuesSchema,
  Requirements,
  RequirementsSchema,
} from '../schemas';

export async function* fixer(
  meta: ProblematicRequirements,
): Stream<LLMResponseChunk, Either<LLMFailure, [Conversation, Requirements]>> {
  console.log('=== REQUIREMENTS FIXER ===');

  return yield* interactive({
    query: JSON.stringify(meta),
    system: createSystemPrompt(),
    llm: llm.thinking,
    tools: [],
    response: {
      description: 'Call when fixes are ready; pass fixed requirements in.',
      schema: RequirementsSchema,
    },
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
    .replace(
      '{ProblematicRequirements}',
      JSON.stringify(ProblematicRequirementsSchema.toJSONSchema()),
    );
}

const ProblematicRequirementsSchema = z.object({
  issues: IssuesSchema.describe('Issues to fix'),
  context: ContextSchema,
});

type ProblematicRequirements = z.Infer<typeof ProblematicRequirementsSchema>;
