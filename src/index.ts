type RecursionEnd<TA> = { tag: 'end'; value: TA };

type RecursiveCall<TA> = {
  tag: 'call';
  call(): Recursion<TA>;
  compute(value: TA): TA;
};

class Recursion<TA> {
  private constructor(private value: RecursionEnd<TA> | RecursiveCall<TA>) {}

  static end<TA>(value: TA): Recursion<TA> {
    return new Recursion<TA>({ tag: 'end', value });
  }

  static call<TA>(
    call: () => Recursion<TA>,
    compute: (value: TA) => TA
  ): Recursion<TA> {
    return new Recursion<TA>({ tag: 'call', call, compute });
  }

  map = <TB>(transform: (value: TA) => TB): Recursion<TB> => {
    return Recursion.end(transform(this.fold()));
  };

  flatMap = <TB>(transform: (value: TA) => Recursion<TB>): Recursion<TB> => {
    return transform(this.fold());
  };

  fold = (): TA => {
    const callstack: RecursiveCall<TA>[] = [];
    let current = this.value;

    while (current.tag === 'call' || callstack.length > 0) {
      if (current.tag === 'call') {
        callstack.push(current);

        current = current.call().value;

        continue;
      }

      const last = callstack.pop()!;

      current = Recursion.end(last.compute(current.value)).value;
    }

    return current.value;
  };
}

type List<TA> = { value: TA; tail: List<TA> } | null;

const range = (from: number, to: number): Recursion<List<number>> => {
  if (from === to) {
    return Recursion.end(null);
  }

  return Recursion.call(
    () => range(from + 1, to),
    (tail) => ({ value: from, tail })
  );
};

const filter =
  <TA>(pred: (value: TA) => boolean) =>
  (list: List<TA>): Recursion<List<TA>> => {
    if (list === null) {
      return Recursion.end(null);
    }

    if (pred(list.value)) {
      return Recursion.call(
        () => filter(pred)(list.tail),
        (tail) => ({ value: list.value, tail })
      );
    }

    return Recursion.call(
      () => filter(pred)(list.tail),
      (tail) => tail
    );
  };

const toArray = <TA>(list: List<TA>): Recursion<TA[]> => {
  if (list === null) {
    return Recursion.end([]);
  }

  return Recursion.call(
    () => toArray(list.tail),
    (tail) => [list.value, ...tail]
  );
};

const head = <TA>(list: List<TA>): TA | null => {
  if (list === null) {
    return null;
  }

  return list.value;
};

console.log(
  range(1, 10)
    .flatMap(filter((value) => value % 2 === 0))
    .flatMap(toArray)
    .fold()
);

// (a: Container<A>) => A;

console.log([1, 2, 3, 4, 5].reduce((a, b) => a * b));
