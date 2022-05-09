import { TypeNode } from '../core';
import { fromErrorMessage } from '../validate';
import { createTypeNode } from './createTypeNode';

export const number = (): TypeNode<number> =>
  createTypeNode({
    validate: (value) => {
      if (typeof value === 'number') {
        return [];
      }

      return [fromErrorMessage('Not a number')];
    },
    defaults: () => 0,
  });

export const nil = (): TypeNode<undefined | null> =>
  createTypeNode({
    validate: (value) => {
      if (value === null || value === undefined) {
        return [];
      }

      return [fromErrorMessage('Not nil')];
    },
    defaults: () => undefined,
  });
