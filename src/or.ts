import { TypeNode } from './core';
import { createAtomicTypeNode } from './type-node/createAtomicTypeNode';
import { validate } from './validate';

export const or = <TLeft, TRight>(
  left: TypeNode<TLeft>,
  right: TypeNode<TRight>
): TypeNode<TLeft | TRight> =>
  createAtomicTypeNode<TLeft | TRight>({
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
