import { InferType, TypeNode } from '../core';
import { fromErrorMessage, prependErrorPathWith } from '../translate/error';
import { validate } from '../validate';
import { refine } from '../augmentors/refine';
import { unknown } from './unknown';

export const list = <TChildren extends TypeNode>(
  children: TChildren
): TypeNode<InferType<TChildren>[], TChildren> =>
  refine(unknown(), {
    validate: (value, tn) => {
      if (Array.isArray(value)) {
        return value.flatMap((element, index) =>
          validate(tn.children(), element).map(prependErrorPathWith(index))
        );
      }

      return [fromErrorMessage('Not a list')];
    },
    defaults: () => [],
    children: () => children,
  });
