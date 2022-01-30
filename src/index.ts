import { curry } from './curry';

const split = curry((delim: string, source: string) => source.split(delim));

const filter = curry((pred: (char: string) => boolean, xs: string[]) =>
  xs.filter(pred)
);

const match = curry((pattern: RegExp, source: string) => {
  return pattern.test(source);
});

const reduce = curry(
  (
    next: (seed: number, current: number) => number,
    seed: number,
    xs: number[]
  ) => xs.reduce(next, seed)
);

const words = split(' ');
const filterQs = filter(match(/q/i));
const max = reduce((x: number, y: number) => (x >= y ? x : y))(-Infinity);

console.log(max([0, 1, 2, 4]));
