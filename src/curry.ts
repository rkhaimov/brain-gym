const _curry = (fn: (...args: unknown[]) => unknown) => {
  const call = (...args: unknown[]): unknown => {
    if (args.length >= fn.length) {
      return fn(...args);
    }

    return call.bind(null, ...args);
  };

  return call;
};

export const curry = _curry as Curry;

function assert(cond: unknown): asserts cond {
  if (cond) {
    return;
  }

  throw new Error('Condition failed');
}

// TODO: It infers template types as unknowns...
type Curry = {
  <TFN extends () => any>(fn: TFN): TFN;
  <TFN extends (...args: any[]) => any>(fn: TFN): TupleToCurry<
    [...Parameters<TFN>, ReturnType<TFN>]
  >;
};

type TupleToCurry<RTuple> = RTuple extends [infer RHead, ...infer RTail]
  ? RTail extends []
    ? RHead
    : (arg: RHead) => TupleToCurry<RTail>
  : never;
