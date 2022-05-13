import { InferChildren, TypeNode } from '../core';

export const childrenMap =
  <TTypeNode extends TypeNode>(rewrite: () => InferChildren<TTypeNode>) =>
  (tn: TTypeNode) => ({
    ...tn,
    children: rewrite,
  });
