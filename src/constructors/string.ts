import { TypeConstructor } from './types';
import { Either } from '../either';

export const string = (): TypeConstructor<string, string> => (value) => {
  if (typeof value === 'string') {
    return Either.right(value);
  }

  return Either.left('is not a string');
};
