import { TypeNode } from '../core';
import { narrow } from '../validate';

export interface ContainerTypeNode<TType, TChildren extends TypeNode>
  extends TypeNode<TType> {
  children(): TChildren;
}

export const createContainerTypeNode = <TType, TChildren extends TypeNode>(
  config: Pick<
    ContainerTypeNode<TType, TChildren>,
    'validate' | 'defaults' | 'children'
  >
) => {
  const tn: ContainerTypeNode<TType, TChildren> = {
    validate: config.validate,
    children: config.children,
    defaults: () => narrow(tn, config.defaults()),
    wrap: (transform, ...transforms) =>
      transforms.reduce((last, curr) => curr(last), transform(tn)),
    clone: ({ validate, defaults }) =>
      createContainerTypeNode({
        validate,
        defaults,
        children: config.children,
      }),
  };

  return tn;
};
