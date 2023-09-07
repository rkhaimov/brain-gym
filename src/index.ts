type Either<A, B> = { type: 'left'; value: A } | { type: 'right'; value: B };

declare const eitherMap: <A, B, C, D>(
  input: Either<A, B>,
  left: (input: A) => C,
  right: (input: B) => D
) => Either<C, D>;

type Const<T> = void;

const constMap = <A, B>(input: Const<A>, transform: (input: A) => B) => input;

type Identity<T> = T;

const identityMap = <A, B>(input: Identity<A>, transform: (input: A) => B) => transform(input);

type Maybe<T> = Either<Const<T>, Identity<T>>;

const maybeMap = <A, B>(input: Maybe<A>, transform: (input: A) => B): Maybe<B> =>
  eitherMap(
    input,
    (left) => constMap(left, transform),
    (right) => identityMap(right, transform)
  );

export {};
