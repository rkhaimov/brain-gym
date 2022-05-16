import { Operator, TypeNode } from '../core';
import { defaultsMap } from './defaultsMap';

export const defaultsFrom =
  <TType, TFrom extends TType>(from: TypeNode<TFrom>): Operator<TType> =>
  (tn) =>
    tn.pipe(defaultsMap(() => from.defaults()));
