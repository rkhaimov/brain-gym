import { TypeNode } from '../core';

export interface ContainerTypeNode<TType, TChildren extends TypeNode>
  extends TypeNode<TType> {
  children(): TChildren;
}

export const createContainerTypeNode = <
  TType,
  TChildren extends TypeNode
>(config: {
  validate: ContainerTypeNode<TType, TChildren>['__validate'];
  defaults: ContainerTypeNode<TType, TChildren>['defaults'];
  children: ContainerTypeNode<TType, TChildren>['children'];
  translate?: ContainerTypeNode<TType, TChildren>['translate'];
}) => {
  const tn: ContainerTypeNode<TType, TChildren> = {
    children: config.children,
    translate: config.translate ?? ((error) => error),
    __validate: config.validate,
    defaults: config.defaults,
    wrap: (transform, ...transforms) =>
      transforms.reduce((last, curr) => curr(last), transform(tn)),
    clone: ({ __validate, ...and }) =>
      createContainerTypeNode({
        ...config,
        ...and,
        validate: __validate ?? config.validate,
      }),
  };

  return tn;
};
