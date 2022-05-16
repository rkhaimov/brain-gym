import { Operator, TypeNode } from '../core';

export const unknown = (): TypeNode => ({
  dictionary: {},
  validate: () => [],
  defaults: () => undefined,
  pipe(...transforms: Array<Operator<any, any>>) {
    return transforms.reduce((last, transform) => transform(last), this);
  },
});
