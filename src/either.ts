type Left<TValue> = { left: TValue };

type Right<TValue> = { right: TValue };

export type Either<TLeft, TRight> = Left<TLeft> | Right<TRight>;

export const left = <TValue>(value: TValue): Left<TValue> => ({ left: value });

const isLeft = <TLeft>(either: Either<TLeft, unknown>): either is Left<TLeft> =>
  'left' in either;

export const right = <TValue>(value: TValue): Right<TValue> => ({
  right: value,
});

export const fold =
  <TLeft, TRight, TResult>(onLeft: (left: TLeft) => TResult) =>
  (onRight: (right: TRight) => TResult) =>
  (either: Either<TLeft, TRight>): TResult => {
    if (isLeft(either)) {
      return onLeft(either.left);
    }

    return onRight(either.right);
  };

export const map =
  <TLeft, TInput, TResult>(t: (input: TInput) => TResult) =>
  (either: Either<TLeft, TInput>): Either<TLeft, TResult> => {
    if (isLeft(either)) {
      return either;
    }

    return right(t(either.right));
  };

export const flatMap =
  <TLeft, TInput, TResult>(t: (input: TInput) => Either<TLeft, TResult>) =>
  (either: Either<TLeft, TInput>): Either<TLeft, TResult> => {
    if (isLeft(either)) {
      return either;
    }

    return t(either.right);
  };
