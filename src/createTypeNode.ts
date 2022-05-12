import { TypeNode, TypeNodeConfig } from './core';

export const createTypeNode = <TType>(
  config: TypeNodeConfig<TType>
): Omit<TypeNode<TType>, '__clone'> => {
  return {
    __dictionary: config.dictionary ?? {},
    __validate: config.validate,
    defaults: config.defaults,
    wrap(...transforms) {
      return transforms.reduce(
        (last, curr) => curr(last),
        this as TypeNode<TType>
      );
    },
  };
};
