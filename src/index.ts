type Brand<T, TName extends string> = T & { [Key in `__${TName}`]: TName };
type Either<A, B> = Left<A> | Right<B>;
type Left<A> = { type: 'left'; value: A };
type Right<B> = { type: 'right'; value: B };

declare function isEitherLeft<T>(input: Either<T, unknown>): input is Left<T>;

declare function not(input: boolean): boolean;

declare function hole<T>(): T;

type Zero = Brand<unknown, 'Zero'>;
type Successor<R extends PositiveNumber> = () => R;
type PositiveNumber = Zero | Successor<any>;

type Add<TLeft extends PositiveNumber, TRight extends PositiveNumber> = TLeft extends Zero
  ? TRight
  : TLeft extends Successor<infer TOf>
  ? Add<TOf, Successor<TRight>>
  : TRight;

type ToNumber<T extends PositiveNumber> = _ToNumber<T>['length'];

type _ToNumber<T extends PositiveNumber> = T extends Zero
  ? []
  : T extends Successor<infer TOf>
  ? [0, ..._ToNumber<TOf>]
  : [];

type One = Successor<Zero>;
type Two = Successor<One>;

declare const t: ToNumber<Add<Two, One>>;

export {};
