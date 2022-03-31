import { times } from './times';

export function minA2(f: (x0: number, x1: number) => number): [number, number] {
  const epochs = 1_000;

  const epsilon = (epoch: number): number =>
    (epochs - epoch) * Math.pow(10, -1);

  let x0 = 0;
  let x1 = 0;

  for (const epoch of times(epochs)) {
    const slopeX0 = deriv((x) => f(x, x1), x0);
    const slopeX1 = deriv((x) => f(x0, x), x1);

    x0 -= slopeX0 * epsilon(epoch);
    x1 -= slopeX1 * epsilon(epoch);
  }

  return [x0, x1];
}

function min(f: (x: number) => number): number {
  const epochs = 1_000;

  const epsilon = (epoch: number): number =>
    (epochs - epoch) * Math.pow(10, -1);

  let from = 0;

  for (const epoch of times(epochs)) {
    const slope = deriv(f, from);

    from -= slope * epsilon(epoch);
  }

  return from;
}

export function deriv(f: (x: number) => number, at: number) {
  const small = Math.pow(10, -2);

  return (f(at + small) - f(at)) / small;
}
