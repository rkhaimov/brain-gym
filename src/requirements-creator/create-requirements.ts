import { LLMResponseChunk } from '@lib/llm/types/response-chunk-types';
import { Either } from '@utils/Either';
import { Stream } from '@utils/Stream';
import { Conversation } from '../Conversation';
import { analyst } from './analyst';
import { fixer } from './fixer';
import { Context, Requirements } from './schemas';
import { reviewer } from './reviewer';
import { StructuredFailure } from '@lib/llm/structured';
import { LLMFailure } from '@lib/llm/types/types';

type RequirementFailure = StructuredFailure | LLMFailure;

export async function* createRequirements(
  intent: string,
): Stream<LLMResponseChunk, Either<RequirementFailure, Requirements>> {
  const requirements = yield* analyst(intent);

  if (Either.isLeft(requirements)) {
    return requirements;
  }

  return yield* refine({
    conversation: Conversation.merge(
      Conversation.fromQuery(intent),
      requirements.value[0],
    ),
    requirements: requirements.value[1],
    fixed: [],
  });
}

async function* refine(
  context: Context,
): Stream<LLMResponseChunk, Either<RequirementFailure, Requirements>> {
  let state = context;

  while (true) {
    const issues = yield* reviewer(state);

    if (Either.isLeft(issues)) {
      return issues;
    }

    if (issues.value.length === 0) {
      return Either.right(state.requirements);
    }

    const fixed = yield* fixer({ context: state, issues: issues.value });

    if (Either.isLeft(fixed)) {
      return fixed;
    }

    state = {
      conversation: Conversation.merge(state.conversation, fixed.value[0]),
      requirements: fixed.value[1],
      fixed: [...state.fixed, ...issues.value],
    };
  }
}
