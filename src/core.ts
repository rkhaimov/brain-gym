export type InternalValidationError = {
  paths: Array<string | number>;
  message: string;
};

export interface TypeNode<TType = unknown> {
  wrap(...transforms: TypeNodeOperator<this>[]): this;

  clone(tn: Pick<this, 'validate' | 'defaults'>): this;

  validate(value: TType): InternalValidationError[];

  defaults(): TType;
}

export type TypeNodeOperator<TTypeNode extends TypeNode> = (
  tn: TTypeNode
) => TTypeNode;

export type ToType<TTN extends TypeNode> = TTN extends TypeNode<infer RType>
  ? RType
  : never;
