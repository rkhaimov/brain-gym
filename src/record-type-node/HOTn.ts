import { pick as _pick } from 'lodash-es';
import { StructTypeNode, TNRecord } from './createRecordTypeNode';
import { struct } from './struct';

export const pick = <TRecord extends TNRecord, TKey extends keyof TRecord>(
  tn: StructTypeNode<TRecord>,
  keys: ReadonlyArray<TKey>
): StructTypeNode<Pick<TRecord, TKey>> => struct(_pick(tn.record(), keys));

export const get = <TRecord extends TNRecord, TKey extends string>(
  tn: StructTypeNode<TRecord>,
  key: TKey
): TRecord[TKey] => tn.record()[key];

export const extend = <TLeft extends TNRecord, TRight extends TNRecord>(
  left: StructTypeNode<TLeft>,
  right: StructTypeNode<TRight>
): StructTypeNode<TLeft & TRight> =>
  struct({ ...left.record(), ...right.record() });

export const rewrite = <TRecord extends TNRecord>(
  tn: StructTypeNode<TRecord>,
  rewrites: RewritesOf<TRecord>
): StructTypeNode<TRecord> => {
  const rewritten = Object.fromEntries(
    Object.entries(tn.record()).map(([key, tn]) => [
      key,
      rewrites[key](tn as TRecord[string]),
    ])
  );

  return struct(rewritten as unknown as TRecord);
};

export type RewritesOf<TRecord extends TNRecord> = {
  [TKey in keyof TRecord]: (tn: TRecord[TKey]) => TRecord[TKey];
};
