import { ToType, TypeNode, TypeNodeOperator } from '../core';
import { defaultsMap } from './defaultsMap';
import { defaults } from './index';

export const defaultsFrom =
  <TTypeNode extends TypeNode>(
    from: TypeNode<ToType<TTypeNode>>
  ): TypeNodeOperator<TTypeNode> =>
  (tn) =>
    tn.wrap(defaultsMap(() => defaults(from)));
