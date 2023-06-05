type Matcher<TOrigin, TResult> = {
  on<TRefined extends TOrigin>(
    refiner: (input: TOrigin) => input is TRefined,
    act: (input: TRefined) => TResult,
  ): Matcher<Exclude<TOrigin, TRefined>, TResult>;
  orElse(act: (input: TOrigin) => TResult): TResult;
};

declare function match<TOrigin, TResult>(input: TOrigin): Matcher<TOrigin, TResult>;

