import { Either } from '@utils/Either';
import { Failure } from '@utils/Failure';
import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
import { Tests } from '../../test-writer/schemas';
import { CheckFailureBody, Implementation } from '../schemas';
import { bundle, BundleHandle } from './bundle';

type CheckFailure = Failure<'CheckFailure', CheckFailureBody>;

export async function check(
  implementation: Implementation,
  tests: Tests,
): Promise<Either<CheckFailure, BundleHandle>> {
  const build = bundle(implementation, tests);

  try {
    await exec('npx tsc --noEmit');
  } catch (error: unknown) {
    build.remove();

    return Either.left({
      kind: 'CheckFailure',
      body: {
        bundle: build.meta,
        stage: 'compile',
        errors: toReadableError(error),
      },
    });
  }

  try {
    await exec(`npx tsx ${build.meta.test.path}`);

    return Either.right(build);
  } catch (error: unknown) {
    build.remove();

    return Either.left({
      kind: 'CheckFailure',
      body: {
        bundle: build.meta,
        stage: 'test',
        errors: toReadableError(error),
      },
    });
  }
}

const exec = promisify(_exec);

function toReadableError(error: unknown): string {
  if (!isExecError(error)) {
    return 'Unknown check error';
  }

  if (error.stderr) {
    return error.stderr;
  }

  if (error.stdout) {
    return error.stdout;
  }

  return error.message;
}

function isExecError(
  error: unknown,
): error is Error & { stderr?: string; stdout?: string } {
  return error instanceof Error;
}
