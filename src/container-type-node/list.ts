import { ToType, TypeNode } from '../core';
import { fromErrorMessage, prependErrorPathWith } from '../validate';
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
          tn.validate(element).map(prependErrorPathWith(index))
        );
      }

      return [fromErrorMessage('Not a list')];
    },
    defaults: () => [],
    children: () => tn,
  });
