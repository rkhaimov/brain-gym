import { fromKindAndPayload, prependErrorPathWith } from '../translate/error';
import { validate } from '../validate';
import { unknown } from './unknown';
import { InferType, TypeNode } from '../core';
import { refineMap } from '../operators/refineMap';
import { defaultsMap } from '../operators/defaultsMap';

declare module 'errors-meta-dictionary' {
  interface MetaDictionary {
    object: void;
  }
}

type TypeNodeRecord = Record<keyof any, TypeNode>;
type TypeNodeRecordToType<TRecord extends TypeNodeRecord> = {
  [TKey in keyof TRecord]: InferType<TRecord[TKey]>;
};

export const struct = <TRecord extends TypeNodeRecord>(children: TRecord) => {
  const tn = unknown().pipe(
    refineMap((value: TypeNodeRecordToType<TRecord>) => {
      if (typeof value !== 'object' || value === null) {
        return [fromKindAndPayload('object')];
      }

      return Object.entries(children).flatMap(([key, child]) =>
        validate(child, value[key as keyof typeof value]).map(
          prependErrorPathWith(key)
        )
      );
    }),
    defaultsMap(
      () =>
        Object.fromEntries(
          Object.entries(children).map(([key, child]) => [
            key,
            child.defaults(),
          ])
        ) as TypeNodeRecordToType<TRecord>
    )
  );

  return { ...tn, children: () => children };
};
