import { TypeNode } from '../core';
import { Dictionary } from './dictionary';

export const translateTo =
  (dictionary: Dictionary) =>
  <TTypeNode extends TypeNode>(tn: TTypeNode): TTypeNode =>
    tn.__clone({ dictionary: { ...tn.__dictionary, ...dictionary } });
