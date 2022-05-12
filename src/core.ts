import { Dictionary } from './translate/dictionary';
import { InternalValidationError } from './translate/error';

export type TypeNodeConfig<TType = unknown> = {
  validate: TypeNode<TType>['__validate'];
  defaults: TypeNode<TType>['defaults'];
  dictionary?: TypeNode<TType>['__dictionary'];
};

export interface TypeNode<TType = unknown> {
  wrap(...transforms: TypeNodeOperator<this>[]): this;

  defaults(): TType;

  __clone(tn: Partial<TypeNodeConfig<TType>>): this;

  __validate(value: TType): InternalValidationError[];

  __dictionary: Dictionary;
}

export type TypeNodeOperator<TTypeNode extends TypeNode> = (
  tn: TTypeNode
) => TTypeNode;

export type ToType<TTN extends TypeNode> = TTN extends TypeNode<infer RType>
  ? RType
  : never;
