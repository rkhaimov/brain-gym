import { deriv, linspace, times } from './utils';
import { point, render } from './render';

const x = linspace(-20, 20, 100);

function f(x: number) {
  return Math.pow(1 - (2 * x + 3 * 4), 2);
}

const chart = render(x, f);

const fd = deriv(f);
const epochs = 100;
const lrnrate = Math.pow(10, -2);

let guess = x[10];

const xgen = closest(x, guess);
point(chart, { x: xgen, y: f(xgen) });

times(epochs, () => {
  const slope = fd(guess);

  guess = guess - slope * lrnrate;
});

const xmin = closest(x, guess);
point(chart, { x: xmin, y: f(xmin) });

function closest(numbers: number[], x: number) {
  return numbers.reduce((closest, number) => {
    if (
      Math.abs(Math.abs(closest) - Math.abs(x)) >
      Math.abs(Math.abs(number) - Math.abs(x))
    ) {
      return number;
    }

    return closest;
  }, numbers[0]);
}

export {};
