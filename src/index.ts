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

const flatMap = <TLeftA, TLeftB, TRightA, TRightB, TResult>(
  either: Either<TLeftA, TRightA>,
  transform: (value: TRightA) => Either<TLeftB, TRightB>
): Either<TLeftA | TLeftB, TRightB> => {
  if (either.tag === 'left') {
    return either;
  }

  return transform(either.value);
};

enum HeadErrors {
  ListIsEmpty,
}

const head = <T>(ns: T[]): Either<HeadErrors, T> => {
  if (ns.length === 0) {
    return left(HeadErrors.ListIsEmpty);
  }

  return right(ns[0]);
};

enum ParseErrors {
  NotValidInt,
}

const parse = (n: string): Either<ParseErrors, number> => {
  if (isNaN(parseInt(n, 10))) {
    return left(ParseErrors.NotValidInt);
  }

  return right(parseInt(n, 10));
};

const magic = (input: string[]) => {
  return flatMap(head(input), parse);
};

const result = fold(
  magic(['123']),
  (error): string => {
    if (error === HeadErrors.ListIsEmpty) {
      return 'My list is empty';
    }

    if (error === ParseErrors.NotValidInt) {
      return 'Not valid int';
    }

    return error;
  },
  (result) => {
    return 'Your result is ' + result;
  }
);

console.log(result);
