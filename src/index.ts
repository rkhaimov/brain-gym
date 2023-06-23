type Either<TLeft, TRight> = Left<TLeft> | Right<TRight>;

type Left<TValue> = { type: 'left'; value: TValue };
type Right<TValue> = { type: 'right'; value: TValue };

declare function left<TValue>(value: TValue): Either<TValue, never>;

declare function right<TValue>(value: TValue): Either<never, TValue>;

function i(n: number): number {
  return n;
}

function j(b: boolean): number {
  return b ? 0 : 1;
}

function m(e: Either<number, boolean>): number {
  return e.type === 'left' ? i(e.value) : j(e.value);
}

export {};
