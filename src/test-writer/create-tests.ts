import { StructuredFailure } from '@lib/llm/structured';
import { LLMResponseChunk } from '@lib/llm/types/response-chunk-types';
import { Either } from '@utils/Either';
import { Stream } from '@utils/Stream';
import { Requirements } from '../requirements-creator/schemas';
import { fixer } from './fixer';
import { reviewer } from './reviewer';
import { Context, Tests } from './schemas';
import { tester } from './tester/tester';

export async function* createTests(
  requirements: Requirements,
): Stream<LLMResponseChunk, Either<StructuredFailure, Tests>> {
  const tests = yield* tester(requirements);

  if (Either.isLeft(tests)) {
    return tests;
  }

  return yield* refine({
    requirements,
    tests: tests.value,
    fixed: [],
  });
}

async function* refine(
  context: Context,
): Stream<LLMResponseChunk, Either<StructuredFailure, Tests>> {
  let state = context;

  while (true) {
    const issues = yield* reviewer(state);

    if (Either.isLeft(issues)) {
      return issues;
    }

    if (issues.value.length === 0) {
      return Either.right(state.tests);
    }

    const fixed = yield* fixer({ context: state, issues: issues.value });

    if (Either.isLeft(fixed)) {
      return fixed;
    }

    state = {
      requirements: state.requirements,
      tests: fixed.value,
      fixed: [...state.fixed, ...issues.value],
    };
  }
}
