import { ToType, TypeNode } from '../core';
import { narrow } from '../validate';

export type TNRecord = Record<keyof any, TypeNode>;
export type TypeNodeRecordToType<TRecord extends TNRecord> = {
  [TKey in keyof TRecord]: ToType<TRecord[TKey]>;
};

export interface StructTypeNode<TRecord extends TNRecord>
  extends TypeNode<TypeNodeRecordToType<TRecord>> {
  record(): TRecord;
}

export const createRecordTypeNode = <TRecord extends TNRecord>(
  config: Pick<StructTypeNode<TRecord>, 'validate' | 'record' | 'defaults'>
) => {
  const tn: StructTypeNode<TRecord> = {
    record: config.record,
    validate: config.validate,
    defaults: () => narrow(tn, config.defaults()),
    wrap: (transform, ...transforms) =>
      transforms.reduce((last, curr) => curr(last), transform(tn)),
    clone: ({ validate, defaults }) =>
      createRecordTypeNode({ validate, defaults, record: config.record }),
  };

  return tn;
};
