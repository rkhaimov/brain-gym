type TaskFactory<TLeft, TRight> = (
  right: (value: TRight) => void,
  left: (value: TLeft) => void
) => void;

export class TaskEither<TLeft, TRight> {
  private static readonly PENDING: unique symbol = Symbol('PENDING');

  constructor(private factory: TaskFactory<TLeft, TRight>) {}

  static sequenceM = <TLeft, TRight>(
    mas: Array<TaskEither<TLeft, TRight>>
  ): TaskEither<TLeft, Array<TRight>> => {
    if (mas.length === 0) {
      return TaskEither.right([]);
    }

    const [ma, ...tail] = mas;

    return ma.flatMap((a) => TaskEither.sequenceM(tail).map((b) => [a, ...b]));
  };

  static sequenceA = <TLeft, TRight>(
    mas: Array<TaskEither<TLeft, TRight>>
  ): TaskEither<Array<TLeft>, Array<TRight>> => {
    if (mas.length === 0) {
      return TaskEither.right([]);
    }

    const cons = TaskEither.liftA2((a: TRight, as: TRight[]) => [a, ...as]);

    const [ma, ...tail] = mas;

    return cons(ma, TaskEither.sequenceM(tail));
  };

  static liftA2 =
    <TA, TB, TC>(fn: (a: TA, b: TB) => TC) =>
      <TLeft>(
        ma: TaskEither<TLeft, TA>,
        mb: TaskEither<TLeft, TB>
      ): TaskEither<TLeft[], TC> => {
        return TaskEither.of((resolve, reject) => {
          const rights: [
              TA | typeof TaskEither.PENDING,
              TB | typeof TaskEither.PENDING
          ] = [TaskEither.PENDING, TaskEither.PENDING];

          const lefts: [
              TLeft | typeof TaskEither.PENDING,
              TLeft | typeof TaskEither.PENDING
          ] = [TaskEither.PENDING, TaskEither.PENDING];

          const maybeDone = (): void => {
            const cr = compact(rights);

            if (cr.length === 2) {
              resolve(fn(...(cr as [TA, TB])));

              return;
            }

            const cl = compact(lefts);

            if (cl.length === 2) {
              reject(cl);

              return;
            }

            if (cr.length + cl.length === 2) {
              reject(cl);

              return;
            }
          };

          const compact = <TX>(xs: (TX | typeof TaskEither.PENDING)[]): TX[] =>
            xs.filter((x): x is TX => x !== TaskEither.PENDING);

          ma.fold(
            (left) => {
              lefts[0] = left;

              maybeDone();
            },
            (right) => {
              rights[0] = right;

              maybeDone();
            }
          );

          mb.fold(
            (left) => {
              lefts[1] = left;

              maybeDone();
            },
            (right) => {
              rights[1] = right;

              maybeDone();
            }
          );
        });
      };

  static delayed(ms: number): TaskEither<never, void> {
    return TaskEither.of((resolve) => setTimeout(() => resolve(), ms));
  }

  static of<TLeft, TRight>(
    factory: TaskFactory<TLeft, TRight>
  ): TaskEither<TLeft, TRight> {
    return new TaskEither(factory);
  }

  static right<TLeft, TRight>(value: TRight): TaskEither<TLeft, TRight> {
    return TaskEither.of((resolve) => resolve(value));
  }

  static left<TLeft>(value: TLeft): TaskEither<TLeft, never> {
    return TaskEither.of((resolve, reject) => reject(value));
  }

  map = <TRightB>(
    transform: (value: TRight) => TRightB
  ): TaskEither<TLeft, TRightB> => {
    return this.flatMap((a) => TaskEither.right(transform(a)));
  };

  flatMap = <TLeftB, TRightB>(
    transform: (value: TRight) => TaskEither<TLeftB, TRightB>
  ): TaskEither<TLeft | TLeftB, TRightB> => {
    return TaskEither.of((resolve, reject) =>
      this.factory(
        (right) => transform(right).factory(resolve, reject),
        (left) => reject(left)
      )
    );
  };

  fold = (
    onLeft: (value: TLeft) => void,
    onRight: (value: TRight) => void
  ): void => {
    this.factory(onRight, onLeft);
  };
}
