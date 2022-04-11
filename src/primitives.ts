import { TypeNode } from './core';

export const number = (): TypeNode<number> => ({
  validate: (value) => {
    if (typeof value === 'number') {
      return [];
    }

    return [{ paths: [], message: 'Not a number' }];
  },
});

export const string = (): TypeNode<string> => ({
  validate: (value) => {
    if (typeof value === 'string') {
      return [];
    }

    return [{ paths: [], message: 'Not a string' }];
  },
});

export const boolean = (): TypeNode<boolean> => ({
  validate: (value) => {
    if (typeof value === 'boolean') {
      return [];
    }

    return [{ paths: [], message: 'Not a boolean' }];
  },
})
