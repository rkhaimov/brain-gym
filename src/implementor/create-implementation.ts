import { StructuredFailure } from '@lib/llm/structured';
import { LLMResponseChunk } from '@lib/llm/types/response-chunk-types';
import { Either } from '@utils/Either';
import { Stream } from '@utils/Stream';
import { Requirements } from '../requirements-creator/schemas';
import { Tests } from '../test-writer/schemas';
import { check } from './check';
import { fixer } from './fixer';
import { implement } from './implement';
import { Implementation } from './schemas';

export async function* createImplementation(
  requirements: Requirements,
  tests: Tests,
): Stream<LLMResponseChunk, Either<StructuredFailure, Implementation>> {
  const implementation = yield* implement(requirements);

  if (Either.isLeft(implementation)) {
    return implementation;
  }

  return yield* refine(requirements, tests, implementation.value);
}

async function* refine(
  requirements: Requirements,
  tests: Tests,
  implementation: Implementation,
): Stream<LLMResponseChunk, Either<StructuredFailure, Implementation>> {
  let state = implementation;

  while (true) {
    const checkResult = await check(state, tests);

    if (Either.isRight(checkResult)) {
      return Either.right(state);
    }

    const fixed = yield* fixer({
      requirements,
      failure: checkResult.value.body,
    });

    if (Either.isLeft(fixed)) {
      return fixed;
    }

    state = fixed.value;
  }
}
