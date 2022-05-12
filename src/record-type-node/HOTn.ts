import { pick as _pick } from 'lodash-es';
import { translateFrom } from '../translate/translateFrom';
import { RecordTypeNode, TnRecord } from './createRecordTypeNode';
import { struct } from './struct';

// TODO: Should not reference directly on struct constructor
export const pick = <TRecord extends TnRecord, TKey extends keyof TRecord>(
  tn: RecordTypeNode<TRecord>,
  keys: ReadonlyArray<TKey>
): RecordTypeNode<Pick<TRecord, TKey>> => struct(_pick(tn.record(), keys));

export const get = <TRecord extends TnRecord, TKey extends keyof TRecord>(
  tn: RecordTypeNode<TRecord>,
  key: TKey
): TRecord[TKey] => tn.record()[key];

export const extend = <TLeft extends TnRecord, TRight extends TnRecord>(
  left: RecordTypeNode<TLeft>,
  right: RecordTypeNode<TRight>
): RecordTypeNode<TLeft & TRight> =>
  struct({ ...left.record(), ...right.record() }).wrap(
    translateFrom(left),
    translateFrom(right)
  );

export const rewriteRecordWith = <TRecord extends TnRecord>(
  tn: RecordTypeNode<TRecord>,
  rewrites: Partial<RewritesOf<TRecord>>
): RecordTypeNode<TRecord> => {
  const rewritten = Object.fromEntries(
    Object.entries(tn.record())
      .filter(([key]) => key in rewrites)
      .map(([key, tn]) => [key, rewrites[key]!(tn as TRecord[string])])
  );

  return extend(tn, struct(rewritten));
};

export type RewritesOf<TRecord extends TnRecord> = {
  [TKey in keyof TRecord]: (tn: TRecord[TKey]) => TRecord[TKey];
};
