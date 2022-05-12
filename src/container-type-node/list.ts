import { ToType, TypeNode } from '../core';
import { fromErrorMessage, prependErrorPathWith, validate } from '../validate';
import {
  ContainerTypeNode,
  createContainerTypeNode,
} from './createContainerTypeNode';

export const list = <TChildren extends TypeNode>(
  tn: TChildren
): ContainerTypeNode<ToType<TChildren>[], TChildren> =>
  createContainerTypeNode({
    validate: (value) => {
      if (Array.isArray(value)) {
        return value.flatMap((element, index) =>
          validate(tn, element).map(prependErrorPathWith(index))
        );
      }

      return [fromErrorMessage('Not a list')];
    },
    defaults: () => [],
    children: () => tn,
  });
