import { TypeNode } from '../core';
import { createTypeNode } from './createTypeNode';

export const or = <TLeft, TRight>(
  left: TypeNode<TLeft>,
  right: TypeNode<TRight>
): TypeNode<TLeft | TRight> =>
  createTypeNode<TLeft | TRight>({
    validate: (value) => {
      const lerrors = left.validate(value as TLeft);

      if (lerrors.length === 0) {
        return [];
      }

      const rerrors = right.validate(value as TRight);

      if (rerrors.length === 0) {
        return [];
      }

      return [...lerrors, ...rerrors];
    },
    defaults: left.defaults,
  });

export const brand = <TType, TBrand extends string>(
  tn: TypeNode<TType>,
  brand: TBrand
): TypeNode<TType & { __brand: TBrand }> =>
  tn as TypeNode<TType & { __brand: TBrand }>;
