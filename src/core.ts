import { Dictionary } from './translate/dictionary';
import { InternalValidationError } from './translate/error';

export type TypeNode<TType = unknown> = {
  dictionary: Dictionary;
  pipe: Pipe<TType>;
  validate(value: TType): InternalValidationError[];
  defaults(): TType;
};

export type Operator<TA, TB = TA> = (tn: TypeNode<TA>) => TypeNode<TB>;

export type InferType<TTN extends TypeNode> = TTN extends TypeNode<infer RType>
  ? RType
  : never;

type Pipe<T> = {
  (): TypeNode<T>;
  <A>(o1: Operator<T, A>): TypeNode<A>;
  <A, B>(o1: Operator<T, A>, o2: Operator<A, B>): TypeNode<B>;
  <A, B, C>(
    o1: Operator<T, A>,
    o2: Operator<A, B>,
    o3: Operator<B, C>
  ): TypeNode<C>;
};
