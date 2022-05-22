type Right<TValue> = {
  tag: 'right';
  value: TValue;
};

type Left<TValue> = {
  tag: 'left';
  value: TValue;
};

function left<TValue>(value: TValue): Left<TValue> {
  return {
    tag: 'left',
    value,
  };
}

function right<TValue>(value: TValue): Right<TValue> {
  return {
    tag: 'right',
    value,
  };
}

type Either<TLeft, TRight> = Left<TLeft> | Right<TRight>;

const head = <T>(ns: T[]): Either<string, T> => {
  if (ns.length === 0) {
    return left('List is empty');
  }

  return right(ns[0]);
};

const fold = <TLeft, TRight, TResult>(
  either: Either<TLeft, TRight>,
  onLeft: (left: TLeft) => TResult,
  onRight: (left: TRight) => TResult
) => {
  if (either.tag === 'left') {
    return onLeft(either.value);
  }

  return onRight(either.value);
};

const map = <TLeft, TRightA, TRightB, TResult>(
  either: Either<TLeft, TRightA>,
  transform: (value: TRightA) => TRightB
): Either<TLeft, TRightB> => {
  if (either.tag === 'left') {
    return either;
  }

  return right(transform(either.value));
};

const headShout = (input: string[]) => {
  return map(head(input), (str) => str.toUpperCase());
};

console.log(headShout([]));
