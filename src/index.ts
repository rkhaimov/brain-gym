import * as tf from '@tensorflow/tfjs';
import { Tensor } from '@tensorflow/tfjs';
import { Tensor2D } from '@tensorflow/tfjs-core/dist/tensor';

const { renderPoint, clearCanvas } = createRenderers();

const X = times(10).map((_, index) => index);
const Y = X.map((_, index) => index * 2);

const Xt = tf
  .ones([X.length, 1])
  .concat(tf.tensor(X).reshape([X.length, 1]), 1);

const Yt = tf.tensor(Y).reshape([Y.length, 1]);

const theta = learn(Xt, Yt);

predict(tf.tensor([1, 8]).reshape([2, 1]), theta).print();

function learn(
  X: Tensor,
  Y: Tensor,
  theta = tf.zeros([2, 1]),
  epoch = 0
): Tensor {
  const lr = Math.pow(10, -3);

  if (epoch === 1000) {
    return theta;
  }

  const next = theta.sub(X.transpose().matMul(X.matMul(theta).sub(Y)).mul(lr));

  return learn(X, Y, next, epoch + 1);
}

function predict(X: Tensor, theta: Tensor): Tensor {
  return X.transpose().matMul(theta).sum();
}

function scale(scale: number): Tensor2D {
  return tf.tensor2d([
    [scale, 0, 0],
    [0, scale, 0],
    [0, 0, scale],
  ]);
}

function renderTensors(tf: Tensor) {
  return tf
    .transpose()
    .array()
    .then((points) => {
      clearCanvas();

      return (points as number[][]).map(([x, y, z]) => {
        return renderPoint(
          x,
          y,
          z,
          `rgb(${Math.abs(x)}, ${Math.abs(y)}, ${Math.abs(z)})`
        );
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

function times(n: number): number[] {
  return new Array(n).fill(0);
}
