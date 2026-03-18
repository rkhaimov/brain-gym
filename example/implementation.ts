import { IO } from '@utils/IO';
import { ExitCode } from '@utils/ExitCode';
import { Stream } from '@utils/Stream';

export default async function* main(): Stream<IO, ExitCode> {
  const argv = yield* IO.argv();
  const firstArg = argv[0];

  if (firstArg === undefined) {
    yield* IO.write('Error: expected one numeric argument.', 'stderr');
    return ExitCode.create(1);
  }

  const numberValue = Number(firstArg);
  if (Number.isNaN(numberValue)) {
    yield* IO.write(`Error: '${firstArg}' is not a valid number.`, 'stderr');
    return ExitCode.create(1);
  }

  const doubled = numberValue * 2;
  const output = String(doubled);
  yield* IO.write(output, 'stdout');
  return ExitCode.create(0);
}
