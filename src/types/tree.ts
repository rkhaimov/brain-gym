import { InferType, TypeNode } from '../core';
import { struct } from './struct';
import { or } from '../hot/or';
import { nil, Nillable } from './nil';
import { lazy } from '../hot/lazy';

type Tree<TElement> = Nillable<{
  value: TElement;
  left: Tree<TElement>;
  right: Tree<TElement>;
}>;

export const tree = <TChildren extends TypeNode>(
  children: TChildren
): TypeNode<Tree<InferType<TChildren>>> => {
  return or(
    nil(),
    struct({
      value: children,
      left: lazy(() => tree(children)),
      right: lazy(() => tree(children)),
    })
  );
};

