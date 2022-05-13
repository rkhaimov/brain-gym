import { TypeNode } from './core';
import { refine } from './augmentors/refine';
import { unknown } from './types/unknown';
import { validate } from './validate';
import { defaults } from './defaults';

export const lazy = <TTypeNode extends TypeNode>(ctn: () => TTypeNode) =>
  refine(unknown(), {
    validate: (value) => validate(ctn(), value),
    defaults: () => defaults(ctn()),
    children: () => ctn().children()
  }) as TTypeNode;
