import * as tf from '@tensorflow/tfjs';
import { concat, Tensor } from '@tensorflow/tfjs';
import { Tensor2D } from '@tensorflow/tfjs-core/dist/tensor';
import {
  animationFrameScheduler,
  BehaviorSubject,
  concatMap,
  map,
  observeOn,
  timer,
  withLatestFrom,
} from 'rxjs';

const { renderPoint, clearCanvas } = createRenderers();

const points$ = new BehaviorSubject<Tensor>(cube(16));

const sun = tf.tensor2d([0, 0, 0], [3, 1]);

const SPEED = Math.PI / Math.pow(2, 10);

timer(0, 1_000 / 60)
  .pipe(
    observeOn(animationFrameScheduler),
    withLatestFrom(points$),
    map(([, points]) => points),
    map((points) => rotateYZ(SPEED).matMul(points)),
    map((points) => rotateXZ(SPEED).matMul(points))
  )
  .subscribe(points$);

points$
  .pipe(
    map((tensors) => scale(40).matMul(tensors)),
    map((tensors) =>
      tensors.concat(tensors.sub(sun).norm('euclidean', 0, true), 0)
    ),
    concatMap(renderTensors)
  )
  .subscribe();

// COLORS as VECTORS

function rotateXY(degree: number): Tensor2D {
  return tf.tensor2d([
    [Math.cos(degree), -Math.sin(degree), 0],
    [Math.sin(degree), Math.cos(degree), 0],
    [0, 0, 1],
  ]);
}

function rotateYZ(degree: number): Tensor2D {
  return tf.tensor2d([
    [1, 0, 0],
    [0, Math.cos(degree), -Math.sin(degree)],
    [0, Math.sin(degree), Math.cos(degree)],
  ]);
}

function rotateXZ(degree: number): Tensor2D {
  return tf.tensor2d([
    [Math.cos(degree), 0, -Math.sin(degree)],
    [0, 1, 0],
    [Math.sin(degree), 0, Math.cos(degree)],
  ]);
}

function scale(scale: number): Tensor2D {
  return tf.tensor2d([
    [scale, 0, 0],
    [0, scale, 0],
    [0, 0, scale],
  ]);
}

function sphere(size: number): Tensor2D {
  const grid: Tensor2D[] = new Array(size).fill(0).flatMap((_, x) =>
    new Array(size).fill(0).flatMap((_, y) =>
      new Array(size)
        .fill(0)
        .map((_, z) => [x - size / 2, y - size / 2, z - size / 2])
        .filter(
          ([x, y, z]) =>
            Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2) <=
            Math.pow(size / 2, 2)
        )
        .map((coords) => tf.tensor2d(coords, [3, 1]))
    )
  );

  return concat(grid, 1);
}

function cube(size: number): Tensor2D {
  const grid: Tensor2D[] = new Array(size)
    .fill(0)
    .flatMap((_, x) =>
      new Array(size)
        .fill(0)
        .flatMap((_, y) =>
          new Array(size)
            .fill(0)
            .map((_, z) =>
              tf.tensor2d([x - size / 2, y - size / 2, z - size / 2], [3, 1])
            )
        )
    );

  return concat(grid, 1);
}

function renderTensors(tf: Tensor) {
  return tf
    .transpose()
    .array()
    .then((points) => {
      clearCanvas();

      return (points as number[][]).map(([x, y, z, dsun]) => {
        const color = 255 / (dsun / 300);

        return renderPoint(x, y, z, `rgb(${color}, ${color}, ${color})`);
      });
    });
}

function createRenderers() {
  document.querySelector('html')!.style.height = '100%';
  document.body.style.height = '100%';
  document.body.style.margin = '0';

  document.body.innerHTML = `<svg id='canvas' xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'></svg>`;

  const canvas = document.querySelector('#canvas') as HTMLElement;

  return {
    renderPoint,
    clearCanvas: () => (canvas.innerHTML = ''),
  };

  function renderPoint(x: number, y: number, z: number, color = '#000') {
    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    );

    circle.setAttribute('fill', color);

    circle.setAttribute('cx', `${toWebX(x)}px`);
    circle.setAttribute('cy', `${toWebY(y)}px`);
    circle.setAttribute('r', `${10 * (Math.abs(z + 200) / 400)}px`);

    canvas.appendChild(circle);
  }

  function toWebX(x: number) {
    return x + window.innerWidth / 2;
  }

  function toWebY(y: number) {
    return window.innerHeight / 2 - y;
  }
}
