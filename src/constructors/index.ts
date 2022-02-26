import { Either } from '../either';
import { string } from './string';
import { TypeConstructor } from './types';
import { number } from './number';
import { struct } from './struct';
import { optional } from './optional';

export const type = {
  of:
    <TLeft, TRight>(
      name: string,
      constructor: TypeConstructor<TLeft, TRight>
    ) =>
    (value: unknown): Either<TLeft, TRight> =>
      constructor(value).leftMap((left) => {
        if (typeof left === 'string') {
          return `${name} ${left}` as unknown as TLeft;
        }

        return left;
      }),
  string,
  number,
  struct,
  optional,
};
