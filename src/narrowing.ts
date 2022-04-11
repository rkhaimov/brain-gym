import { TypeNode } from './core';

export const and = <TLeft, TRight>(
  left: TypeNode<TLeft>,
  right: TypeNode<TRight>
): TypeNode<TLeft & TRight> => ({
  validate: (value) => {
    const lerrors = left.validate(value);
    const rerrors = right.validate(value);

    return [...lerrors, ...rerrors];
  },
});

export const dividedBy = (
  tn: TypeNode<number>,
  factor: number
): TypeNode<number> => ({
  validate: (value) => {
    const errors = tn.validate(value);

    if (errors.length > 0) {
      return errors;
    }

    if (value % factor === 0) {
      return [];
    }

    return [{ paths: [], message: `is not dividable by ${factor}` }];
  },
});
