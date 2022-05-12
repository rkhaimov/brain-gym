import { TypeNode } from '../core';
import { translateTo } from './translateTo';

export const translateFrom =
  <TFrom extends TypeNode>(from: TFrom) =>
  <TTypeNode extends TypeNode>(tn: TTypeNode): TTypeNode =>
    tn.wrap(translateTo(from.__dictionary));
