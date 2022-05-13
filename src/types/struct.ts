import { fromKindAndPayload, prependErrorPathWith } from '../translate/error';
import { validate } from '../validate';
import { refine } from '../augmentors/refine';
import { unknown } from './unknown';
import { InferType, TypeNode } from '../core';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    object: void;
  }
}

export type TypeNodeRecord = Record<keyof any, TypeNode>;

export type TypeNodeRecordToType<TRecord extends TypeNodeRecord> = {
  [TKey in keyof TRecord]: InferType<TRecord[TKey]>;
};

export type RecordTypeNode<TRecord extends TypeNodeRecord> = TypeNode<
  TypeNodeRecordToType<TRecord>,
  TRecord
>;

export const struct = <TRecord extends TypeNodeRecord>(
  children: TRecord
): TypeNode<TypeNodeRecordToType<TRecord>, TRecord> =>
  refine(unknown(), {
    validate: (value, tn) => {
      if (typeof value !== 'object' || value === null) {
        return [fromKindAndPayload('object')];
      }

      return Object.entries(tn.children()).flatMap(([key, child]) =>
        validate(child, value[key as keyof typeof value]).map(
          prependErrorPathWith(key)
        )
      );
    },
    defaults: (tn) =>
      Object.fromEntries(
        Object.entries(tn.children()).map(([key, child]) => [
          key,
          child.defaults(child),
        ])
      ) as TypeNodeRecordToType<TRecord>,
    children: () => children,
  });
