import { LLMResponseChunk } from '@lib/llm/types/response-chunk-types';
import { render } from '@lib/render';
import { Either } from '@utils/Either';
import { Stream } from '@utils/Stream';
import { createImplementation } from './implementor/create-implementation';
import { createRequirements } from './requirements-creator/create-requirements';
import { createTests } from './test-writer/create-tests';

async function main() {
  return render(run('I want to build a function that doubles a number'));
}

async function* run(query: string): Stream<LLMResponseChunk, unknown> {
  const requirements = yield* createRequirements(query);

  if (Either.isLeft(requirements)) {
    return requirements;
  }

  const tests = yield* createTests(requirements.value);

  if (Either.isLeft(tests)) {
    return tests;
  }

  const implementation = yield* createImplementation(
    requirements.value,
    tests.value,
  );

  return JSON.stringify(
    {
      requirements: requirements.value,
      tests: tests.value,
      implementation: implementation.value,
    },
    null,
    2,
  );
}

void main();
