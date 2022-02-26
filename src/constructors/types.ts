import { Either } from '../either';

export type TypeConstructor<TLeft, TRight> = (
  value: unknown
) => Either<TLeft, TRight>;
