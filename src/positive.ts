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

function createPositiveFromLength(input: string): PositiveNumber {
  return fromNumber(input.length);
}

