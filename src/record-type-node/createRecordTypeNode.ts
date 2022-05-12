import { ToType, TypeNode, TypeNodeConfig } from '../core';
import { createTypeNode } from '../createTypeNode';

export type TnRecord = Record<keyof any, TypeNode>;
export type TnRecordToType<TRecord extends TnRecord> = {
  [TKey in keyof TRecord]: ToType<TRecord[TKey]>;
};

export interface RecordTypeNode<TRecord extends TnRecord>
  extends TypeNode<TnRecordToType<TRecord>> {
  record(): TRecord;
}

type RecordConfig<TRecord extends TnRecord> = TypeNodeConfig<
  TnRecordToType<TRecord>
> &
  Pick<RecordTypeNode<TRecord>, 'record'>;

export const createRecordTypeNode = <TRecord extends TnRecord>(
  config: RecordConfig<TRecord>
): RecordTypeNode<TRecord> => {
  return {
    ...createTypeNode(config),
    record: config.record,
    __clone: (and) =>
      createRecordTypeNode({
        ...config,
        ...and,
      }),
  } as RecordTypeNode<TRecord>;
};
