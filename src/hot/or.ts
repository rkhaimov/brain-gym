import { TypeNode } from '../core';
import { validate } from '../validate';
import { unknown } from '../types/unknown';
import { refineMap } from '../operators/refineMap';
import { defaultsFrom } from '../operators/defaultsFrom';

export const or = <TLeft, TRight>(
  left: TypeNode<TLeft>,
  right: TypeNode<TRight>
) =>
  unknown().pipe(
    refineMap((value: TLeft | TRight) => {
      const lerrors = validate(left, value as TLeft);

      if (lerrors.length === 0) {
        return [];
      }

      const rerrors = validate(right, value as TRight);

      if (rerrors.length === 0) {
        return [];
      }

      return [...lerrors, ...rerrors];
    }),
    defaultsFrom(left)
  );
