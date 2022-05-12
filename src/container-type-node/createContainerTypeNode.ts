import { TypeNode, TypeNodeConfig } from '../core';
import { createTypeNode } from '../createTypeNode';

export interface ContainerTypeNode<TType, TChildren extends TypeNode>
  extends TypeNode<TType> {
  children(): TChildren;
}

type ContainerConfig<
  TType,
  TChildren extends TypeNode
> = TypeNodeConfig<TType> &
  Pick<ContainerTypeNode<TType, TChildren>, 'children'>;

export const createContainerTypeNode = <TType, TChildren extends TypeNode>(
  config: ContainerConfig<TType, TChildren>
): ContainerTypeNode<TType, TChildren> => {
  return {
    ...createTypeNode(config),
    children: config.children,
    __clone: (and) => createContainerTypeNode({ ...config, ...and }),
  } as ContainerTypeNode<TType, TChildren>;
};
