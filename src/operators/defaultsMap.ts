import { InferType, TypeNode, TypeNodeOperator } from '../core';

export const defaultsMap =
  <TTypeNode extends TypeNode>(
    transform: (tn: TTypeNode) => InferType<TTypeNode>
  ) =>
  (tn: TTypeNode) => ({
    ...tn,
    defaults: transform,
  });
