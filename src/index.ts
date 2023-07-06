type Either<TLeft, TRight> = Left<TLeft> | Right<TRight>;

type Left<TValue> = { type: 'left'; value: TValue };
type Right<TValue> = { type: 'right'; value: TValue };

declare function left<TValue>(value: TValue): Either<TValue, never>;

declare function right<TValue>(value: TValue): Either<never, TValue>;

type APlusA<A> = Either<A, A>;

type TwoA<A> = [boolean, A];

function aPlusAToTwoA<A>(input: APlusA<A>): TwoA<A> {
  return [input.type === 'right', input.value];
}

function twoAToAPlusA<A>(input: TwoA<A>): APlusA<A> {
  return input[0] ? right(input[1]) : left(input[1]);
}
