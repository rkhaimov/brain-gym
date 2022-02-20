type FoldingTree<TElement> = ComputeNode<TElement> | ValueNode<TElement>;

type ComputeNode<TElement> = {
  tag: 'compute';
  left(): FoldingTree<TElement>;
  right(): FoldingTree<TElement>;
  compute(left: TElement, right: TElement): TElement;
};

type ValueNode<TElement> = {
  tag: 'value';
  value: TElement;
};

type Compose = {
  <I0, I1, I2, I3, R0>(
    f0: (i0: I0) => FoldingTree<I1>,
    f1: (i0: FoldingTree<I1>) => FoldingTree<I2>,
    f2: (i0: FoldingTree<I2>) => FoldingTree<I3>,
    f3: (i0: FoldingTree<I3>) => FoldingTree<R0>
  ): (i0: I0) => R0;
};

const _compose = (...args: Array<(...args: unknown[]) => unknown>): unknown => {
  return (input: unknown) =>
    FT.fold(
      args.reduce((last, arg) => arg(last), input) as FoldingTree<unknown>
    );
};

const compose = _compose as Compose;

// Hack
const nothing = <TElement>(): ValueNode<TElement> => {
  const id = undefined as unknown as TElement;

  return { value: id, tag: 'value' };
};

const operation = <TElement>(
  compute: (left: TElement, right: TElement) => TElement,
  elements: Array<() => FoldingTree<TElement>>
): FoldingTree<TElement> => {
  if (elements.length === 0) {
    return {
      tag: 'compute',
      compute,
      left: nothing,
      right: nothing,
    };
  }

  if (elements.length === 1) {
    return {
      tag: 'compute',
      compute,
      left: elements[0],
      right: nothing,
    };
  }

  const ofAny = (
    elements: Array<() => FoldingTree<TElement>>
  ): FoldingTree<TElement> => {
    if (elements.length === 0) {
      throw new Error('Bad condition');
    }

    if (elements.length === 1) {
      return elements[0]();
    }

    const right = ofAny(elements.slice(1));

    return {
      tag: 'compute',
      compute,
      left: elements[0],
      right: () => right,
    };
  };

  return ofAny(elements);
};

const value = <TElement>(value: TElement): ValueNode<TElement> => ({
  tag: 'value',
  value,
});

const flatMap =
  <TElement, TNext>(transform: (element: TElement) => FoldingTree<TNext>) =>
  (tree: FoldingTree<TElement>): FoldingTree<TNext> =>
    transform(fold(tree));

const map =
  <TElement, TNext>(transform: (element: TElement) => TNext) =>
  (tree: FoldingTree<TElement>): FoldingTree<TNext> =>
    value(transform(fold(tree)));

const fold = <TElement>(tree: FoldingTree<TElement>): TElement => {
  type Footprint<TElement> = [
    ComputeNode<TElement>,
    ValueNode<TElement>?,
    ValueNode<TElement>?
  ];

  const footprints: Array<Footprint<TElement>> = [];
  let curr = tree;

  while (curr.tag !== 'value' || footprints.length > 0) {
    while (curr.tag !== 'value') {
      footprints.push([curr]);
      curr = curr.left();
    }

    footprints[footprints.length - 1].push(curr);

    if (footprints[footprints.length - 1].length === 3) {
      const [compute, v0, v1] = footprints.pop()!;

      curr = { tag: 'value', value: compute.compute(v0!.value, v1!.value) };
    } else {
      curr = footprints[footprints.length - 1][0].right();
    }
  }

  return curr.value;
};

const FT = { fold, value, operation, flatMap, map, compose };

const sort = (ns: number[]): FoldingTree<number[]> => {
  if (ns.length < 2) {
    return FT.value(ns);
  }

  const [n, ...tail] = ns;

  return FT.operation(
    (left, right) => [...left, n, ...right],
    [
      () => sort(tail.filter((x) => x <= n)),
      () => sort(tail.filter((x) => x > n)),
    ]
  );
};

const range = (to: number): FoldingTree<number[]> => {
  if (to === 0) {
    return FT.value([]);
  }

  return FT.operation((left) => [to, ...left], [() => range(to - 1)]);
};

const rib = (n: number): FoldingTree<number> => {
  if (n <= 2) {
    return value(n);
  }

  return operation(
    (left, right) => left + right,
    [() => rib(n - 1), () => rib(n - 2), () => rib(n - 3)]
  );
};

const onlyEvens = (ns: number[]): number[] => ns.filter((n) => n % 2 === 0);

const magic = FT.compose(
  rib,
  FT.flatMap(range),
  FT.flatMap(sort),
  FT.map(onlyEvens)
);

console.log(magic(10));
