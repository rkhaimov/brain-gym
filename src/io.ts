export type IO<TValue> = { value: () => TValue };

export const io = <TValue>(value: () => TValue): IO<TValue> => ({
  value: value,
});

export const map =
  <TInput, TReturn>(t: (value: TInput) => TReturn) =>
  (input: IO<TInput>): IO<TReturn> => {
    return io(() => t(input.value()));
  };

export const flatMap =
  <TInput, TReturn>(t: (value: TInput) => IO<TReturn>) =>
  (input: IO<TInput>): IO<TReturn> => {
    return io(() => t(input.value()).value());
  };

export const unsafeRun = <TInput>(input: IO<TInput>) => input.value();
