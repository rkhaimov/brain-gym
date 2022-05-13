import { TypeNode } from '../core';
import { validate } from '../validate';
import { refine } from './refine';
import { unknown } from '../types/unknown';

export const or = <TLeft, TRight>(
  left: TypeNode<TLeft>,
  right: TypeNode<TRight>
): TypeNode<TLeft | TRight> =>
  refine(unknown(), {
    validate: (value) => {
      const lerrors = validate(left, value as TLeft);

      if (lerrors.length === 0) {
        return [];
      }

      const rerrors = validate(right, value as TRight);

      if (rerrors.length === 0) {
        return [];
      }

      return [...lerrors, ...rerrors];
    },
    defaults: left.defaults,
  });
