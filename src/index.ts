import { classify, Source } from './classify';
import { LLMFailure } from './core/llm/types/types';
import { createGithubExpert } from './createGithubExpert';
import { createSlackExpert } from './createSlackExpert';
import { Result, synthesize } from './synthesize';
import { Either } from './utils/Either';
import { Task } from './utils/Task';

// https://docs.langchain.com/oss/javascript/langchain/multi-agent/router-knowledge-base
async function main() {
  return console.log(await run('How to rebase on a branch'));
}

async function run(question: string) {
  const classified = await classify(question);

  if (Either.isLeft(classified)) {
    return classified;
  }

  const { classifications } = classified.value;

  const results = await Task.all(
    classifications.map(async ({ source, query }): Task<LLMFailure, Result> => {
      const result = await EXPERTS[source](query);

      if (Either.isLeft(result)) {
        return result;
      }

      return Either.right({ source, message: result.value });
    }),
  );

  if (Either.isLeft(results)) {
    return results;
  }

  const synthesis = await synthesize(question, results.value);

  if (Either.isLeft(synthesis)) {
    return synthesis;
  }

  console.log(`\n\n### FINAL ANSWER ###`);
  console.log(synthesis.value.content);
}

const EXPERTS = {
  github: createGithubExpert,
  slack: createSlackExpert,
} satisfies Record<Source, unknown>;

void main();
