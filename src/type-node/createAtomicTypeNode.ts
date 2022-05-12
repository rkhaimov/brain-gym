import { TypeNode, TypeNodeConfig } from '../core';
import { createTypeNode } from '../createTypeNode';

interface AtomicTypeNode<TType> extends TypeNode<TType> {}

export const createAtomicTypeNode = <TType>(
  config: TypeNodeConfig<TType>
): AtomicTypeNode<TType> => {
  return {
    ...createTypeNode(config),
    __clone: (and) => createAtomicTypeNode({ ...config, ...and }),
  };
};
