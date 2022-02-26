import { TypeConstructor } from './types';
import { Either } from '../either';

export const optional =
  <TLeft, TRight>(
    constructor: TypeConstructor<TLeft, TRight>
  ): TypeConstructor<TLeft, TRight | undefined | null> =>
  (value) => {
    if (value === null || value === undefined) {
      return Either.right(value);
    }

    return constructor(value);
  };
