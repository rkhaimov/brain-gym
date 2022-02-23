type Compose = {
  <I0, I1, R0>(f0: (i0: I0) => I1, f1: (i0: I1) => R0): (i0: I0) => R0;
  <I0, I1, I2, R0>(
    f0: (i0: I0) => I1,
    f1: (i0: I1) => I2,
    f2: (i0: I2) => R0
  ): (i0: I0) => R0;
  <I0, I1, I2, I3, R0>(
    f0: (i0: I0) => I1,
    f1: (i0: I1) => I2,
    f2: (i0: I2) => I3,
    f3: (i0: I3) => R0
  ): (i0: I0) => R0;
};

const _compose = (...args: Array<(...args: unknown[]) => unknown>): unknown => {
  return (input: unknown) => args.reduce((last, arg) => arg(last), input);
};

const compose = _compose as Compose;
