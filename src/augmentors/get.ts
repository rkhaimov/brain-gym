import { RecordTypeNode, TypeNodeRecord } from '../types/struct';

export const get = <TRecord extends TypeNodeRecord, TKey extends keyof TRecord>(
  tn: RecordTypeNode<TRecord>,
  key: TKey
): TRecord[TKey] => tn.children()[key];
