import { interactive } from '@lib/llm/interactive';
import { llm } from '@lib/llm/llm';
import { LLMResponseChunk } from '@lib/llm/types/response-chunk-types';
import { LLMFailure } from '@lib/llm/types/types';
import { Either } from '@utils/Either';
import { Stream } from '@utils/Stream';
import fs from 'node:fs';
import path from 'node:path';
import { Conversation } from '../../Conversation';
import { Requirements, RequirementsSchema } from '../schemas';

// TODO: Use creative, exploratory model
export async function* analyst(
  query: string,
): Stream<LLMResponseChunk, Either<LLMFailure, [Conversation, Requirements]>> {
  console.log('=== ANALYST ===');

  return yield* interactive({
    query,
    system: createSystemPrompt(),
    llm: llm.thinking,
    tools: [],
    response: {
      description: 'Call when requirements are ready; pass them in.',
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
    );
}
