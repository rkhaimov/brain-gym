import { RecordTypeNode, struct, TypeNodeRecord } from '../types/struct';
import { translateFrom } from '../operators/translateFrom';

export const extend = <
  TLeft extends TypeNodeRecord,
  TRight extends TypeNodeRecord
>(
  left: RecordTypeNode<TLeft>,
  right: RecordTypeNode<TRight>
): RecordTypeNode<TLeft & TRight> =>
  struct({ ...left.children(), ...right.children() }).operate(
    translateFrom(left),
    translateFrom(right)
  );
