import { ToType, TypeNode } from './core';
import { prependErrorPathWith } from './errors';

export const list = <TType>(tn: TypeNode<TType>): TypeNode<Array<TType>> => ({
  validate: (value) => {
    if (Array.isArray(value)) {
      return value.flatMap((element, index) =>
        tn.validate(element).map(prependErrorPathWith(index))
      );
    }

    return [{ paths: [], message: 'Not an array' }];
  },
});

type StructChildren = Record<string, TypeNode>;

type ChildrenToType<TChildren extends StructChildren> = {
  [TKey in keyof TChildren]: ToType<TChildren[TKey]>;
};

type StructNode<TChildren extends StructChildren> = TypeNode<
  ChildrenToType<TChildren>
> & {
  // Monad?
  extend<TWithChildren extends StructChildren>(
    next: StructNode<TWithChildren>
  ): StructNode<TChildren & TWithChildren>;
  children(): TChildren;
};

export const struct = <TChildren extends StructChildren>(
  children: TChildren
): StructNode<TChildren> => {
  return {
    validate: (value) => {
      if (typeof value !== 'object') {
        return [{ paths: [], message: 'Not an object' }];
      }

      return Object.entries(children)
        .map(([key, tn]) =>
          tn.validate(value[key]).map(prependErrorPathWith(key))
        )
        .flatMap((errors) => errors);
    },
    extend: (next) => struct({ ...children, ...next.children() }),
    children: () => children,
  };
};
