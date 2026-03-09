import { Either } from '../../utils/Either';
import { ask, AskFailure } from './ask';

export const confirm = async (): Promise<Either<AskFailure, true | string>> => {
  console.log('Type yes to confirm or enter rejection reason:');

  const asked = await ask();

  if (Either.isLeft(asked)) {
    return asked;
  }

  if (asked.value === 'yes') {
    return Either.right(true);
  }

  return Either.right(asked.value);
};
