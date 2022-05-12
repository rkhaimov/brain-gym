import { TypeNode } from '../core';
import { translateFrom } from '../translate/translateFrom';
import { ContainerTypeNode } from './createContainerTypeNode';
import { list } from './list';

// TODO: Fix
// TODO: There are two types (Atomic and Compound) use it.
export const rewriteContainerWith = <TType, TChildren extends TypeNode>(
  tn: ContainerTypeNode<TType, TChildren>,
  rewrite: (tch: TChildren) => TChildren
): ContainerTypeNode<TType, TChildren> =>
  list(rewrite(tn.children())).wrap(
    translateFrom(tn)
  ) as unknown as ContainerTypeNode<TType, TChildren>;
