import { Either } from './Either';

export type Task<TLeft, TRight> = Promise<Either<TLeft, TRight>>;
