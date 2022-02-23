type Compose = {
  <I0, I1, R0>(f0: (i0: I0) => I1, f1: (i0: I1) => R0): (i0: I0) => R0;
  <I0, I1, I2, R0>(
    f0: (i0: I0) => I1,
    f1: (i0: I1) => I2,
    f2: (i0: I2) => R0
  ): (i0: I0) => R0;
  <I0, I1, I2, I3, R0>(
    f0: (i0: I0) => I1,
    f1: (i0: I1) => I2,
    f2: (i0: I2) => I3,
    f3: (i0: I3) => R0
  ): (i0: I0) => R0;
  <I0, I1, I2, I3, I4, R0>(
    f0: (i0: I0) => I1,
    f1: (i0: I1) => I2,
    f2: (i0: I2) => I3,
    f3: (i0: I3) => I4,
    f4: (i0: I4) => R0
  ): (i0: I0) => R0;
};

const _compose = (...args: Array<(...args: unknown[]) => unknown>): unknown => {
  return (input: unknown) => args.reduce((last, arg) => arg(last), input);
};

const compose = _compose as Compose;

type StackNode<TElement> = Operation<TElement> | Value<TElement>;

type Operation<TElement> = {
  tag: 'operation';
  elements: Array<() => StackNode<any>>;
  operate(...args: any[]): TElement;
};

type Value<TElement> = { tag: 'value'; value: TElement };

const value = <TElement>(value: TElement): Value<TElement> => ({
  tag: 'value',
  value,
});

const operation = <TElement>(
  operate: Operation<TElement>['operate'],
  ...elements: Operation<TElement>['elements']
): Operation<TElement> => ({
  tag: 'operation',
  operate,
  elements,
});

const range = (from: number, to: number): StackNode<number[]> => {
  if (from === to) {
    return value([]);
  }

  return operation(
    (tail: number[]) => [from, ...tail],
    () => range(from + 1, to)
  );
};

const memo = new Map<number, StackNode<number>>();
const fib = (n: number): StackNode<number> => {
  if (memo.has(n)) {
    return memo.get(n)!;
  }

  if (n < 2) {
    return value(n);
  }

  memo.set(
    n,
    operation(
      (left: number, right: number) => left + right,
      () => fib(n - 1),
      () => fib(n - 2)
    )
  );

  return memo.get(n)!;
};

const sort = (ns: number[]): StackNode<number[]> => {
  if (ns.length < 2) {
    return value(ns);
  }

  const [n, ...tail] = ns;

  return operation(
    (lesser, greater) => [...lesser, n, ...greater],
    () => sort(tail.filter((x) => x > n)),
    () => sort(tail.filter((x) => x <= n))
  );
};

const map =
  <TPrevElement, TNextElement>(
    mapper: (element: TPrevElement) => TNextElement
  ) =>
  (stack: StackNode<TPrevElement>): StackNode<TNextElement> => {
    return value(mapper(fold(stack)));
  };

const flatMap =
  <TPrevElement, TNextElement>(
    mapper: (element: TPrevElement) => StackNode<TNextElement>
  ) =>
  (stack: StackNode<TPrevElement>): StackNode<TNextElement> => {
    return mapper(fold(stack));
  };

const headOfSortedFibRange = compose(
  fib,
  flatMap((to) => range(0, to)),
  flatMap(sort),
  map((ns) => ns.slice(0, 10)),
  fold
);

console.log(headOfSortedFibRange(20));

function fold<TElement>(stack: StackNode<TElement>): TElement {
  let current = stack;
  const footprints: Array<{ node: Operation<TElement>; args: TElement[] }> = [];

  while (current.tag === 'operation' || footprints.length > 0) {
    if (current.tag === 'operation') {
      footprints.push({ node: current, args: [] });
    }

    const last = footprints[footprints.length - 1];

    if (current.tag === 'value') {
      last.args.push(current.value);
    }

    if (last.args.length === last.node.elements.length) {
      const operation = footprints.pop()!;

      current = value(operation.node.operate(...operation.args));
    } else {
      current = last.node.elements[last.args.length]();
    }
  }

  return current.value;
}
