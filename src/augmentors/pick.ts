import { RecordTypeNode, struct, TypeNodeRecord } from '../types/struct';
import { pick as _pick } from 'lodash-es';

export const pick = <
  TRecord extends TypeNodeRecord,
  TKey extends keyof TRecord
>(
  tn: RecordTypeNode<TRecord>,
  keys: ReadonlyArray<TKey>
): RecordTypeNode<Pick<TRecord, TKey>> => struct(_pick(tn.children(), keys));
