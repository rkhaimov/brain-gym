import { StructTypeNode, TNRecord } from './createRecordTypeNode';
import { pick, rewrite, RewritesOf } from './HOTn';

export const pickRewrite = <
  TRecord extends TNRecord,
  TRewrites extends Partial<RewritesOf<TRecord>>
>(
  tn: StructTypeNode<TRecord>,
  rewrites: TRewrites
): StructTypeNode<Pick<TRecord, keyof TRewrites>> => {
  return rewrite(
    pick(tn, Object.keys(rewrites)) as StructTypeNode<TRecord>,
    rewrites as RewritesOf<TRecord>
  );
};
