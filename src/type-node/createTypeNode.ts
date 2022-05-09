import { narrow } from '../validate';
import { TypeNode } from '../core';

export const createTypeNode = <TType>(
  config: Pick<TypeNode<TType>, 'defaults' | 'validate'>
): TypeNode<TType> => {
  const tn: TypeNode<TType> = {
    defaults: () => narrow(tn, config.defaults()),
    wrap: (transform, ...transforms) =>
      transforms.reduce((last, curr) => curr(last), transform(tn)),
    clone: createTypeNode,
    validate: config.validate
  };

  return tn;
};
