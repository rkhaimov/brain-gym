export function wait(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function assertIsNever(
  input?: never,
  message = 'Should never be called',
): never {
  throw new Error(message);
}

export function assertNotEmpty<T>(
  input: T | undefined | null,
  message = 'Expected to be defined',
): asserts input is T {
  if (isNil(input)) {
    throw new Error(message);
  }
}

export function assert(
  input: unknown,
  message = 'Assertion is false',
): asserts input {
  if (!input) {
    throw new Error(message);
  }
}

export function isNil(input: unknown): input is null | undefined {
  return input === undefined || input === null;
}

export function isDefined<T>(input: T): input is Exclude<T, undefined | null> {
  return !isNil(input);
}

export type Brand<TType, TProperty extends string> = TType & {
  [Key in `__${TProperty}`]: TProperty;
};

export type ExtendsBrand<
  TBrand extends Brand<unknown, never>,
  TProperty extends string,
> = Brand<TBrand, TProperty>;
