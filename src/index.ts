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

const flatMap = <TLeft, TRightA, TRightB, TResult>(
  either: Either<TLeft, TRightA>,
  transform: (value: TRightA) => Either<TLeft, TRightB>
): Either<TLeft, TRightB> => {
  if (either.tag === 'left') {
    return either;
  }

  return transform(either.value);
};

const head = <T>(ns: T[]): Either<string, T> => {
  if (ns.length === 0) {
    return left('List is empty');
  }

  return right(ns[0]);
};

const parse = (n: string): Either<string, number> => {
  if (isNaN(parseInt(n, 10))) {
    return left('Not valid integer');
  }

  return right(parseInt(n, 10));
};

const magic = (input: string[]) => {
  return flatMap(head(input), parse);
};

console.log(magic(['0', '1']));
