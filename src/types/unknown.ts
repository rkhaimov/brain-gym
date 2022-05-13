import { TypeNode } from '../core';

export const unknown = (): TypeNode<unknown, never> => ({
  validate: () => [],
  dictionary: () => {
    return {};
  },
  defaults: () => {
    throw new Error('Can not provide defaults for unknown automatically');
  },
  children: () => {
    throw new Error('Atomic types do not have a child');
  },
  operate(...transforms) {
    return transforms.reduce((last, curr) => curr(last), this);
  },
});
