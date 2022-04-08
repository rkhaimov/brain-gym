type Utils<TCurrent, TOriginal> = {
  map<TNext>(t: (a: TCurrent) => TNext): Utils<TNext, TOriginal>;
  filter(t: (a: TCurrent) => boolean): Utils<TCurrent, TOriginal>;
  fold(): Operation<TCurrent, TOriginal>;
};

type Operation<TCurrent, TOriginal> = (
  original: TOriginal
) => TCurrent | undefined;

function createUtils<TCurrent, TOriginal>(
  operation: Operation<TCurrent, TOriginal>,
): Utils<TCurrent, TOriginal> {
  return {
    map<TNext>(t: (a: TCurrent) => TNext): Utils<TNext, TOriginal> {
      return createUtils<TNext, TOriginal>((original) => {
        const prev = operation(original);

        if (prev === undefined) {
          return undefined;
        }

        return t(prev);
      });
    },
    filter(p: (a: TCurrent) => boolean): Utils<TCurrent, TOriginal> {
      return createUtils((original) => {
        const prev = operation(original);

        if (prev === undefined) {
          return undefined;
        }

        if (p(prev)) {
          return prev;
        }

        return undefined;
      });
    },
    fold: () => operation,
  };
}

function wrap<TA>(as: TA[]) {
  return createUtils<TA, TA>((a) => a);
}

function apply<TA, TB>(as: TA[], operation: Operation<TB, TA>): TB[] {
  return as.reduce((result, element) => {
    const transformed = operation(element);

    if (transformed === undefined) {
      return result;
    }

    return [...result, transformed];
  }, [] as TB[]);
}

console.log(
  apply(
    [1, 2, 3],
    createUtils<number, number>((a) => a)
      .map((a) => a * a)
      .map((a) => `${a}`)
      .filter((a) => a.includes('1'))
      .fold()
  )
);
