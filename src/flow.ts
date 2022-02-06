type Flow = {
  <A extends unknown[], B>(f0: (...args: A) => B): (...args: A) => B;
  <A extends unknown[], B, C>(f0: (...args: A) => B, f1: (arg: B) => C): (
    ...args: A
  ) => C;
  <A extends unknown[], B, C, D>(
    f0: (...args: A) => B,
    f1: (arg: B) => C,
    f2: (arg: C) => D
  ): (...args: A) => D;
  <A extends unknown[], B, C, D, E>(
    f0: (...args: A) => B,
    f1: (arg: B) => C,
    f2: (arg: C) => D,
    f3: (arg: D) => E
  ): (...args: A) => E;
  <A extends unknown[], B, C, D, E, F>(
    f0: (...args: A) => B,
    f1: (arg: B) => C,
    f2: (arg: C) => D,
    f3: (arg: D) => E,
    f4: (arg: E) => F
  ): (...args: A) => F;
};

const _flow = (...fns: Array<(arg: unknown) => unknown>) => {
  return (arg: unknown) => fns.reduce((prev, fn) => fn(prev), arg);
};

export const flow = _flow as Flow;
