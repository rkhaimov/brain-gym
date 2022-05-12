import { TypeNode } from '../core';

export const createTypeNode = <TType>(config: {
  validate: TypeNode<TType>['__validate'];
  defaults: TypeNode<TType>['defaults'];
  translate?: TypeNode<TType>['translate'];
}): TypeNode<TType> => {
  const tn: TypeNode<TType> = {
    translate: config.translate ?? ((error) => error),
    __validate: config.validate,
    defaults: config.defaults,
    wrap: (transform, ...transforms) =>
      transforms.reduce((last, curr) => curr(last), transform(tn)),
    clone: ({ __validate, ...and }) =>
      createTypeNode({
        ...config,
        ...and,
        validate: __validate ?? config.validate,
      }),
  };

  return tn;
};
