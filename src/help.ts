type Right<TValue> = {
  tag: 'right';
  value: TValue;
};

type Left<TValue> = {
  tag: 'left';
  value: TValue;
};

class Either<TLeft, TRight> {
  static left<TLeft, TRight>(value: TLeft) {
    return new Either<TLeft, TRight>({ tag: 'left', value });
  }

  static right<TLeft, TRight>(value: TRight) {
    return new Either<TLeft, TRight>({ tag: 'right', value });
  }

  private constructor(private choice: Left<TLeft> | Right<TRight>) {}

  map = <TRightB>(
    transform: (value: TRight) => TRightB
  ): Either<TLeft, TRightB> => {
    if (this.choice.tag === 'left') {
      return Either.left(this.choice.value);
    }

    return Either.right(transform(this.choice.value));
  };

  mapLeft = <TLeftB>(
    transform: (value: TLeft) => TLeftB
  ): Either<TLeftB, TRight> => {
    if (this.choice.tag === 'right') {
      return Either.right(this.choice.value);
    }

    return Either.left(transform(this.choice.value));
  };

  flatMap = <TLeftB, TRightB>(
    transform: (value: TRight) => Either<TLeftB, TRightB>
  ): Either<TLeft | TLeftB, TRightB> => {
    if (this.choice.tag === 'left') {
      return Either.left(this.choice.value);
    }

    return transform(this.choice.value);
  };

  fold = <TResult>(
    onLeft: (left: TLeft) => TResult,
    onRight: (right: TRight) => TResult
  ): TResult => {
    if (this.choice.tag === 'left') {
      return onLeft(this.choice.value);
    }

    return onRight(this.choice.value);
  };
}

const map2 = <TLeft, TRightA, TRightB, TResult>(
  ea: Either<TLeft, TRightA>,
  eb: Either<TLeft, TRightB>,
  transform: (a: TRightA, b: TRightB) => TResult
): Either<TLeft, TResult> => {
  return ea.flatMap((a) => eb.map((b) => transform(a, b)));
};

const prepend = <T>(element: T, elements: T[]): T[] => [element, ...elements];

const sequenceAll = <TLeft, TRight>(
  list: Array<Either<TLeft, TRight>>
): Either<Array<TLeft>, Array<TRight>> => {
  if (list.length === 0) {
    return Either.right([]);
  }

  const [head, ...tail] = list;

  return map2(
    head.mapLeft((error) =>
      sequenceAll(tail).fold(
        (errors) => prepend(error, errors),
        () => [error]
      )
    ),
    sequenceAll(tail),
    prepend
  );
};

enum HeadErrors {
  ListIsEmpty = 'ListIsEmpty',
}

const head = <T>(ns: T[]): Either<HeadErrors, T> => {
  if (ns.length === 0) {
    return Either.left(HeadErrors.ListIsEmpty);
  }

  return Either.right(ns[0]);
};

enum ParseErrors {
  NotValidInt = 'NotValidInt',
}

const parse = (n: string): Either<ParseErrors, number> => {
  if (isNaN(parseInt(n, 10))) {
    return Either.left(ParseErrors.NotValidInt);
  }

  return Either.right(parseInt(n, 10));
};

enum DivideErrors {
  ZeroProvided = 'ZeroProvided',
}

const divide = (n: number, factor: number): Either<DivideErrors, number> => {
  if (factor === 0) {
    return Either.left(DivideErrors.ZeroProvided);
  }

  return Either.right(n / factor);
};

const input0 = ['10', '2', '1'];
const input1 = '12';

sequenceAll([head(input0).flatMap(parse), parse(input1)])
  .flatMap(([n0, n1]) => divide(n0, n1))
  .fold(
    (error) => {
      console.log(error);
    },
    (response) => {
      console.log(response);
    }
  );
