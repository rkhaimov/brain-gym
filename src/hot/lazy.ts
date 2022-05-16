import { TypeNode } from '../core';
import { unknown } from '../types/unknown';
import { validate } from '../validate';
import { refineMap } from '../operators/refineMap';
import { defaultsMap } from '../operators/defaultsMap';

export const lazy = <TType>(ctn: () => TypeNode<TType>) =>
  unknown().pipe(
    refineMap((value: TType) => validate(ctn(), value)),
    defaultsMap(() => ctn().defaults())
  );
