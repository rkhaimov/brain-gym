type HKT<F, A> = [F, A];

const createHKT = <F extends (value: A) => unknown, A>(value: ReturnType<F>): HKT<F, A> => [
  ((_) => value) as F,
  undefined as A,
];

interface Map<F> {
  <A, B>(input: HKT<F, A>, transform: (value: A) => B): HKT<F, B>;
}

interface MaybeFactory {
  <T>(value: T): { type: 'none' } | { type: 'some'; value: T };
}

type Maybe<A> = HKT<MaybeFactory, A>;

const some = <T>(value: T): Maybe<T> => createHKT({ type: 'some', value });

const none = (): Maybe<never> => createHKT({ type: 'none' });

const maybeFold = <T, R>(input: Maybe<T>, onNone: () => R, onSome: (value: T) => R) => {
  const constructed = input[0](input[1]);

  if (constructed.type === 'none') {
    return onNone();
  }

  return onSome(constructed.value);
};

const maybeMap: Map<MaybeFactory> = (input, transform) => maybeFold(input, none, (it) => some(transform(it)));

interface ConstFactory<R> {
  <T>(value: T): R;
}

type Const<R, T> = HKT<ConstFactory<R>, T>;

const createConst = <R, T>(constant: R): HKT<ConstFactory<R>, T> => createHKT(constant);

const constFold = <R>(input: Const<R, unknown>): R => input[0](input[1]);

const createConstMap = (<R, A, B>(input: Const<R, A>, _: (value: A) => B) =>
  createConst<R, B>(constFold(input))) satisfies Map<ConstFactory<unknown>>;

console.log(constFold(createConstMap(createConst<10, string>(10), (value) => value.length)));

export {};
