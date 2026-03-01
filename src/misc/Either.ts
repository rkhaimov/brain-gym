export const Either = {
  right<TRight>(value: TRight): Either<never, TRight> {
    return { type: 'right', value };
  },
  left<TLeft>(value: TLeft): Either<TLeft, never> {
    return { type: 'left', value };
  },
  isLeft<TLeft>(
    either: Either<TLeft, unknown>,
  ): either is Either<TLeft, never> {
    return either.type === 'left';
  },
  isRight<TRight>(
    either: Either<unknown, TRight>,
  ): either is Either<never, TRight> {
    return either.type === 'right';
  },
  fromAsyncThrowable<TArgs extends unknown[], TR>(
    fn: (...args: TArgs) => Promise<TR>,
  ): (...args: TArgs) => Promise<Either<unknown, TR>> {
    return (...args) => fn(...args).then(Either.right, Either.left);
  },
};

export type Either<TLeft, TRight> =
  | { type: 'left'; value: TLeft }
  | { type: 'right'; value: TRight };
