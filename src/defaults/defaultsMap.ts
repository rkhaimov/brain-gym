import { ToType, TypeNode, TypeNodeOperator } from '../core';

export const defaultsMap =
  <TTypeNode extends TypeNode>(
    transform: (defaults: ToType<TTypeNode>, tn: TTypeNode) => ToType<TTypeNode>
  ): TypeNodeOperator<TTypeNode> =>
  (tn) =>
    tn.__clone({
      defaults: () => transform(tn.defaults() as ToType<TTypeNode>, tn),
    });
