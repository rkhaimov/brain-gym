class Lazy<TElement> {
  private constructor(private compute: () => TElement) {}

  static of<TElement>(compute: () => TElement) {
    return new Lazy(compute);
  }

  map = <TNext>(transform: (value: TElement) => TNext): Lazy<TNext> => {
    return Lazy.of(() => transform(this.fold()));
  };

  flatMap = <TNext>(
    transform: (value: TElement) => Lazy<TNext>
  ): Lazy<TNext> => {
    return Lazy.of(() => transform(this.fold()).fold());
  };

  fold = (): TElement => {
    return this.compute();
  };
}

type List<TElement> = Lazy<{ head: TElement; tail: List<TElement> } | null>;

const emptyList = <TElement>(): List<TElement> => Lazy.of(() => null);

const range = (from: number, to: number): List<number> => {
  if (from === to) {
    return emptyList();
  }

  return Lazy.of(() => ({ head: from, tail: range(from + 1, to) }));
};

const take = <TElement>(n: number, list: List<TElement>): List<TElement> => {
  return list.flatMap((clist) => {
    if (n === 0) {
      return emptyList();
    }

    if (clist === null) {
      return emptyList();
    }

    return Lazy.of(() => ({ head: clist.head, tail: take(n - 1, clist.tail) }));
  });
};

const map = <TElement, TNext>(
  transform: (element: TElement) => TNext,
  list: List<TElement>
): List<TNext> => {
  return list.map((clist) => {
    if (clist === null) {
      return null;
    }

    return { head: transform(clist.head), tail: map(transform, clist.tail) };
  });
};

const toPrimes = <TElement>(
  next: (primes: number[], value: TElement) => number | undefined,
  list: List<TElement>,
  previous: number[] = []
): List<number> => {
  const clist = list.fold();

  if (clist === null) {
    return emptyList();
  }

  const nhead = next(previous, clist.head);

  if (nhead === undefined) {
    return toPrimes(next, clist.tail, previous);
  }

  return Lazy.of(() => {
    return {
      head: nhead,
      tail: toPrimes(next, clist.tail, [...previous, nhead]),
    };
  });
};

const toArray = <TElement>(list: List<TElement>): TElement[] => {
  const result: TElement[] = [];

  observe((element) => result.push(element), list);

  return result;
};

const observe = <TElement>(
  onElement: (element: TElement) => void,
  list: List<TElement>
): void => {
  const clist = list.fold();

  if (clist === null) {
    return;
  }

  if (clist.head !== undefined) {
    onElement(clist.head);
  }

  setTimeout(() => observe(onElement, clist.tail));
};

const skip = <TElement>(from: number, list: List<TElement>): List<TElement> => {
  if (from === 0) {
    return list;
  }

  return list.flatMap((clist) => {
    if (clist === null) {
      return emptyList();
    }

    return Lazy.of(() => ({
      head: undefined as unknown as TElement,
      tail: skip(from - 1, clist.tail),
    }));
  });
};

const toPrimes$ = skip(
  1000,
  toPrimes((primes, value) => {
    if (value < 2) {
      return;
    }

    if (primes.every((prime) => value % prime !== 0)) {
      return value;
    }

    return;
  }, range(0, Number.POSITIVE_INFINITY))
);

observe(console.log, take(1000 + 10_000, toPrimes$));
