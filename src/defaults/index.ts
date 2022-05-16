import { TypeNode } from '../core';
import { narrow } from '../validate';

export const defaults = <TType>(tn: TypeNode<TType>) =>
  narrow(tn, tn.defaults());
