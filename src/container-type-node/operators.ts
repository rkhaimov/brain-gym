// TODO: Should generalize to all structures (tuples, trees, graphs)
import { ToType, TypeNode, TypeNodeOperator } from '../core';
import { ContainerTypeNode } from './createContainerTypeNode';
import { andValidate, defaultsTo } from '../operators';
import { fromErrorMessage } from '../validate';

export const nonEmptyList =
  <TChildren extends TypeNode>(): TypeNodeOperator<
    ContainerTypeNode<ToType<TChildren>[], TChildren>
  > =>
  (tn) =>
    tn.wrap(
      defaultsTo(() => [tn.children().defaults() as ToType<TChildren>]),
      andValidate((value) => {
        if (value.length === 0) {
          return [fromErrorMessage('list is empty')];
        }

        return [];
      })
    );
