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

const map2 = <TLeft, TRightA0, TRightA1, TRightB, TResult>(
  either0: Either<TLeft, TRightA0>,
  either1: Either<TLeft, TRightA1>,
  transform: (a0: TRightA0, a1: TRightA1) => TRightB
): Either<TLeft, TRightB> => {
  return flatMap(either0, (a0) => map(either1, (a1) => transform(a0, a1)));
};

const mapLeft = <TLeftA, TLeftB, TRight, TResult>(
  either: Either<TLeftA, TRight>,
  transform: (value: TLeftA) => TLeftB
): Either<TLeftB, TRight> => {
  if (either.tag === 'right') {
    return either;
  }

  return left(transform(either.value));
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

const List = {
  cons: <T>(element: T, elements: T[]): T[] => [element, ...elements],
  from: <T>(element: T): T[] => [element],
};

const Record = {
  cons: <T>(
    entry: [string, T],
    record: Record<string, T>
  ): Record<string, T> => ({ ...record, ...Object.fromEntries([entry]) }),
  from: <T>(entry: [string, T]): Record<string, T> =>
    Object.fromEntries([entry]),
};

const sequenceAll = <TLeft, TRight>(
  list: Array<Either<TLeft, TRight>>
): Either<Array<TLeft>, Array<TRight>> => {
  if (list.length === 0) {
    return right([]);
  }

  const [head, ...tail] = list;

  return map2(
    mapLeft(head, (error) =>
      fold(
        sequenceAll(tail),
        (errors) => List.cons(error, errors),
        () => List.from(error)
      )
    ),
    sequenceAll(tail),
    List.cons
  );
};

const recordSequenceAll = <TLeft, TRight>(
  record: Record<string, Either<TLeft, TRight>>
): Either<Record<string, TLeft>, Record<string, TRight>> => {
  if (Object.entries(record).length === 0) {
    return right({});
  }

  const [[key, head], ...tail] = Object.entries(record);

  return map2(
    mapLeft(head, (error) =>
      fold(
        recordSequenceAll(Object.fromEntries(tail)),
        (errors) => Record.cons([key, error], errors),
        () => Record.from([key, error])
      )
    ),
    recordSequenceAll(Object.fromEntries(tail)),
    (result, results) => Record.cons([key, result], results)
  );
};

enum HeadErrors {
  ListIsEmpty = 'ListIsEmpty',
}

const head = <T>(ns: T[]): Either<HeadErrors, T> => {
  if (ns.length === 0) {
    return left(HeadErrors.ListIsEmpty);
  }

  return right(ns[0]);
};

enum ParseErrors {
  NotValidInt = 'NotValidInt',
}

const parse = (n: string): Either<ParseErrors, number> => {
  if (isNaN(parseInt(n, 10))) {
    return left(ParseErrors.NotValidInt);
  }

  return right(parseInt(n, 10));
};

enum DivideErrors {
  ZeroProvided = 'ZeroProvided',
}

const divide = (n: number, factor: number): Either<DivideErrors, number> => {
  if (factor === 0) {
    return left(DivideErrors.ZeroProvided);
  }

  return right(n / factor);
};

console.log(sequenceAll([right('0'), right('2')]));
console.log(recordSequenceAll({ age: right('1'), height: right('2') }));

const input0 = ['10', '2', '1'];
const input1 = '12';

fold(
  flatMap(
    sequenceAll([flatMap(head(input0), parse), parse(input1)]),
    ([n0, n1]) => divide(n0, n1)
  ),
  (error) => {
    console.log(error);
  },
  (result) => {
    console.log(result);
  }
);
