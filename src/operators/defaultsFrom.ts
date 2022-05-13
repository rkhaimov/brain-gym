import { InferType, TypeNode } from '../core';
import { defaultsMap } from './defaultsMap';
import { defaults } from '../defaults';

export const defaultsFrom =
  <TTypeNode extends TypeNode>(from: TypeNode<InferType<TTypeNode>>) =>
  (tn: TTypeNode) =>
    tn.operate(defaultsMap(() => defaults(from)));
