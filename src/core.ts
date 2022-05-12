import { ValidationMessages } from 'validation-messages';

export type InternalValidationError = {
  paths: Array<string | number>;
  message: string;
  kind: keyof ValidationMessages;
  params: ValidationMessages[keyof ValidationMessages];
};

export interface TypeNode<TType = unknown> {
  wrap(...transforms: TypeNodeOperator<this>[]): this;

  clone(tn: Partial<Pick<this, '__validate' | 'defaults' | 'translate'>>): this;

  __validate(value: TType): InternalValidationError[];

  defaults(): TType;

  translate(error: InternalValidationError): InternalValidationError;
}

export type TypeNodeOperator<TTypeNode extends TypeNode> = (
  tn: TTypeNode
) => TTypeNode;

export type ToType<TTN extends TypeNode> = TTN extends TypeNode<infer RType>
  ? RType
  : never;
