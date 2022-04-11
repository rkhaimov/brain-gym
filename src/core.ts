export type InternalValidationError = { paths: Array<string | number>; message: string };
export type ValidationError = { path: string; message: string };

export type TypeNode<TType = unknown> = {
  validate(value: TType): InternalValidationError[];
};

export type ToType<TTN extends TypeNode> = TTN extends TypeNode<infer RType>
  ? RType
  : never;
