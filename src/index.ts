type HKT<F, A> = [F, A];

interface Construct<F> {
  <A>(input: A): HKT<F, A>;
}

interface Flat<F> {
  <A>(input: HKT<F, HKT<F, A>>): HKT<F, A>;
}

interface Map<F> {
  <A, B>(input: HKT<F, A>, transform: (value: A) => B): HKT<F, B>;
}

interface NaturalTransform<F, S> {
  <A>(input: HKT<F, A>): HKT<S, A>;
}

interface Traverse<F, S> {
  <A>(input: HKT<F, HKT<S, A>>): HKT<S, HKT<F, A>>;
}

interface FlatMap<F> {
  <A, B>(input: HKT<F, A>, transform: (value: A) => HKT<F, B>): HKT<F, B>;
}

const createFlatMap =
  <F>(flat: Flat<F>, map: Map<F>): FlatMap<F> =>
  (input, transform) =>
    flat(map(input, transform));

interface ListFactory {
  <T>(value: T): T[];
}

type List<T> = HKT<ListFactory, T>;

const listOf = <T>(list: T[]): List<T> => [
  (it) => list as never as Array<typeof it>,
  list[0],
];

const listFold = <T>(list: List<T>): T[] => list[0](list[1]);

const createListTraverse = <F>(
  construct: Construct<F>,
  flatMap: FlatMap<F>,
  map: Map<F>
) => {
  const traverse = <T>(input: List<HKT<F, T>>): HKT<F, List<T>> => {
    const list = input[0](input[1]);

    if (list.length === 0) {
      return construct(listOf([]));
    }

    const [head, ...tail] = list;
    const rest = traverse(listOf(tail));

    return flatMap(head, (curr) => map(rest, (inner) => join(inner, curr)));
  };

  return traverse satisfies Traverse<ListFactory, F>;
};

const join = <A>(list: List<A>, value: A): List<A> =>
  listOf([...list[0](list[1]), value]);

interface MaybeFactory {
  <T>(value: T): { type: 'none' } | { type: 'some'; value: T };
}

type Maybe<A> = HKT<MaybeFactory, A>;

const maybeSome = <T>(value: T): Maybe<T> => [
  (it) => ({ type: 'some', value: it }),
  value,
];

const maybeNone = (): Maybe<never> => [
  () => ({ type: 'none' }),
  undefined as never,
];

const maybeFold = <T, R>(
  input: Maybe<T>,
  onNone: () => R,
  onSome: (value: T) => R
) => {
  const constructed = input[0](input[1]);

  if (constructed.type === 'none') {
    return onNone();
  }

  return onSome(constructed.value);
};

const maybeFlat: Flat<MaybeFactory> = (input) =>
  maybeFold(
    input,
    () => maybeNone(),
    (value) => value
  );

const maybeMap: Map<MaybeFactory> = (input, transform) =>
  maybeFold(
    input,
    () => maybeNone(),
    (value) => maybeSome(transform(value))
  );

const maybeFlatMap = createFlatMap(maybeFlat, maybeMap);

const maybeListTraverse = createListTraverse(maybeSome, maybeFlatMap, maybeMap);

const input: List<Maybe<number>> = listOf([maybeSome(20), maybeSome(10)]);
const result = maybeListTraverse(input);

maybeFold(
  result,
  () => {
    console.log('None');
  },
  (value) => {
    console.log(listFold(value)[0].toFixed());
  }
);

export {};
