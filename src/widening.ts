import { ToType, TypeNode } from './core';

export const nullable = <TNode extends TypeNode>(
  tn: TNode
): TypeNode<ToType<TNode> | null | undefined> => ({
  validate: (value) => {
    if (value === null || value === undefined) {
      return [];
    }

    return tn.validate(value);
  },
});

export const or = <TLeft extends TypeNode, TRight extends TypeNode>(
  left: TLeft,
  right: TRight
): TypeNode<ToType<TLeft> | ToType<TRight>> => ({
  validate: (value) => {
    const lerrors = left.validate(value);

    if (lerrors.length === 0) {
      return [];
    }

    const rerrors = right.validate(value);

    if (rerrors.length === 0) {
      return [];
    }

    return [...lerrors, ...rerrors];
  },
});
