import { Dictionary } from './translate/dictionary';
import { InternalValidationError } from './translate/error';

export interface TypeNode<TType = unknown, TChildren = unknown> {
  defaults(tn: this): TType;

  validate(value: TType, tn: this): InternalValidationError[];

  operate(...transforms: TypeNodeOperator<this>[]): this;

  dictionary(): Dictionary;

  children(): TChildren;
}

export type TypeNodeOperator<TTypeNode extends TypeNode> = (
  tn: TTypeNode
) => TTypeNode;

export type InferType<TTN extends TypeNode> = TTN extends TypeNode<infer RType>
  ? RType
  : never;

export type InferChildren<TCTN extends TypeNode> = TCTN extends TypeNode<
  unknown,
  infer RChildren
>
  ? RChildren
  : never;
