type Either<A, B> = Left<A> | Right<B>;
type Left<A> = { type: 'left'; value: A };
type Right<B> = { type: 'right'; value: B };

declare function isEitherLeft<T>(input: Either<T, unknown>): input is Left<T>;

type Matcher<TOrigin, TResult> = {
  on<TRefined extends TOrigin>(
    refiner: (input: TOrigin) => input is TRefined,
    act: (input: TRefined) => TResult,
  ): Matcher<Exclude<TOrigin, TRefined>, TResult>;
  orElse(act: (input: TOrigin) => TResult): TResult;
};

declare function match<TOrigin, TResult>(input: TOrigin): Matcher<TOrigin, TResult>;

// Either empty or not
type List<T> = Either<void, [T, List<T>]>;

declare function createEmptyList<T>(): List<T>;

declare function followedBy<T>(element: T, origin: List<T>): List<T>;

// Either zero or successor (greater than one) of another positive
type PositiveNumber = Either<void, () => PositiveNumber>;

declare function zero(): Left<void>;

declare function successorOf(input: PositiveNumber): PositiveNumber;

function fromNumber(input: number): PositiveNumber {
  if (input === 0) {
    return zero();
  }

  return successorOf(fromNumber(input - 1));
}

const isZero = isEitherLeft<void>;

declare function not(input: boolean): boolean;

const isEven = (input: PositiveNumber): boolean =>
  match<PositiveNumber, boolean>(input)
    .on(isZero, () => true)
    .orElse(({ value }) => not(isEven(value())));

function createPositiveFromLength(input: string): PositiveNumber {
  return fromNumber(input.length);
}

const getEachWordLength = (words: List<string>): List<PositiveNumber> =>
  match<List<string>, List<PositiveNumber>>(words)
    .on(isEitherLeft, (_) => createEmptyList())
    .orElse(({ value: [word, words] }) => followedBy(createPositiveFromLength(word), getEachWordLength(words)));

declare function hole<T>(): T;

export {};
