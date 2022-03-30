import { renderBody, renderPoint } from './render';
import { Point } from './point';
import { Chart } from 'chart.js';
import 'chart.js/auto';

renderBody();

const points: Point[] = [
  { x: 0, y: 500 },
  { x: 500, y: 500 },
  { x: 250, y: 0 },
];

points.map(renderPoint('blue', 10, 1));

// debugger
const guess = minA2((x, y) => score(points, { x, y }));

console.log(score(points, { x: guess[0], y: guess[1] }));

renderPoint('red', 20, 1)({ x: guess[0], y: guess[1] });
renderPoint(
  'brown',
  score(points, { x: guess[0], y: guess[1] }) * 2,
  0
)({ x: guess[0], y: guess[1] });

// inspect();

function minA2(f: (x0: number, x1: number) => number): [number, number] {
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

  console.log(deriv(f, from));
  for (const epoch of times(epochs)) {
    const slope = deriv(f, from);

    from -= slope * epsilon(epoch);
  }
  console.log(deriv(f, from));

  return from;
}

function deriv(f: (x: number) => number, at: number) {
  const small = Math.pow(10, -2);

  return (f(at + small) - f(at)) / small;
}

function score(points: Point[], guess: Point): number {
  return Math.max(...points.map((point) => diff(point, guess)));
}

function sum(a: number, b: number): number {
  return a + b;
}

function diff(left: Point, right: Point): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function times(count: number): number[] {
  return new Array(count).fill(null).map((_, index) => index);
}

function inspect() {
  document.body.innerHTML =
    '<canvas id="chart" width="1000" height="700"></canvas>';

  const steps = 50;

  new Chart(document.querySelector('#chart') as HTMLCanvasElement, {
    type: 'line',
    data: {
      labels: times(steps),
      datasets: [
        {
          label: 'Score',
          data: times(steps).map((proba) => score(points, { y: 0, x: proba })),
          fill: false,
          tension: 0.1,
        },
        {
          label: 'Deriv',
          data: times(steps).map((proba) =>
            deriv((x) => score(points, { y: 0, x }), proba)
          ),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
    },
  });
}
