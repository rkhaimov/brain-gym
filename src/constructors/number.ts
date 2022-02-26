import { TypeConstructor } from './types';
import { Either } from '../either';

export const number = (): TypeConstructor<string, number> => (value) => {
  if (typeof value === 'number') {
    return Either.right(value);
  }

  return Either.left('is not a number');
};

