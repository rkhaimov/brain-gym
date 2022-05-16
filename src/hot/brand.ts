import { TypeNode } from '../core';

export const brand = <TType, TBrand extends string>(
  tn: TypeNode<TType>,
  brand: TBrand
): TypeNode<TType & { __brand: TBrand }> =>
  tn as TypeNode<TType & { __brand: TBrand }>;
