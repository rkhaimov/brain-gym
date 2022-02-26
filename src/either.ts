type Right<TA> = { tag: 'right'; right: TA };
type Left<TA> = { tag: 'left'; left: TA };

type _Either<TLeft, TRight> = Right<TRight> | Left<TLeft>;

export class Either<TLeft, TRight> {
  private constructor(private ma: _Either<TLeft, TRight>) {}

  static right = <TLeft, TRight>(right: TRight): Either<TLeft, TRight> => {
    return new Either({ tag: 'right', right });
  };

  static left = <TLeft, TRight>(left: TLeft): Either<TLeft, TRight> => {
    return new Either({ tag: 'left', left });
  };

  // List[Either[a]] -> Either[List[a]]
  static sequenceM = <TLeft, TRight>(
    elements: Array<Either<TLeft, TRight>>
  ): Either<TLeft, Array<TRight>> => {
    const cons = (xs: Array<TRight>, x: TRight): Array<TRight> => [...xs, x];

    return elements.reduce<Either<TLeft, Array<TRight>>>(
      Either.liftA2(cons),
      Either.right([] as TRight[])
    );
  };

  // List[Either[a]] -> Either[List[a]]
  static sequenceA = <TLeft, TRight>(
    elements: Array<Either<TLeft, TRight>>
  ): Either<Array<TLeft>, Array<TRight>> => {
    const toList = (ma: Either<TLeft, TRight>): Either<TLeft[], TRight[]> =>
      ma.fold(
        (left) => Either.left([left]),
        (right) => Either.right([right])
      );

    const join = (
      ma: Either<TLeft[], TRight[]>,
      mb: Either<TLeft[], TRight[]>
    ): Either<TLeft[], TRight[]> => {
      return ma.fold(
        (aleft) =>
          mb.fold(
            (bleft) => Either.left([...aleft, ...bleft]),
            (bright) => Either.left(aleft)
          ),
        (aright) =>
          mb.fold(
            (bleft) => Either.left(bleft),
            (bright) => Either.right([...aright, ...bright])
          )
      );
    };

    return elements.map(toList).reduce(join);
  };

  /* (a -> b -> c) -> Either[a] -> Either[b] -> Either[c] */
  static liftA2 = <TLeft, TA, TB, TC>(
    operate: (a: TA, b: TB) => TC
  ): ((ma: Either<TLeft, TA>, mb: Either<TLeft, TB>) => Either<TLeft, TC>) => {
    return (ma, mb) => ma.flatMap((a) => mb.map((b) => operate(a, b)));
  };

  // (a -> Either[b]) -> Either[a] -> Either[b]
  flatMap = <TRightB>(
    transform: (value: TRight) => Either<TLeft, TRightB>
  ): Either<TLeft, TRightB> => {
    if (this.ma.tag === 'left') {
      return Either.left(this.ma.left);
    }

    return transform(this.ma.right);
  };

  leftMap = <TLeftB>(
    transform: (value: TLeft) => TLeftB
  ): Either<TLeftB, TRight> => {
    return this.fold(
      (left) => Either.left(transform(left)),
      (right) => Either.right(right)
    );
  };

  // (a -> b) -> Either[a] -> Either[b]
  map = <TRightB>(
    transform: (value: TRight) => TRightB
  ): Either<TLeft, TRightB> => {
    return this.flatMap((value) => Either.right(transform(value)));
  };

  fold = <TOnLeft, TOnRight>(
    onLeft: (left: TLeft) => TOnLeft,
    onRight: (right: TRight) => TOnRight
  ): TOnLeft | TOnRight => {
    if (this.ma.tag === 'left') {
      return onLeft(this.ma.left);
    }

    return onRight(this.ma.right);
  };
}
