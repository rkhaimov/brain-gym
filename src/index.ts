import * as tf from '@tensorflow/tfjs';
import { Tensor } from '@tensorflow/tfjs';
import * as math from 'mathjs';

const { renderPoint, clearCanvas } = createRenderers();

void main();

async function main() {
  const X = times(10).map((_, index) => index);
  const Y = X.map((_, index) => index * 2);

  const Xt = tf
    .ones([X.length, 1])
    .concat(tf.tensor(X).reshape([X.length, 1]), 1);

  const Yt = tf.tensor(Y).reshape([Y.length, 1]);

  const theta = await learn(Xt, Yt);

  theta.print();
}

async function learn(X: Tensor, Y: Tensor): Promise<Tensor> {
  return X.transpose()
    .matMul(X)
    .array()
    .then((matrix) => math.inv(matrix as number[][]) as number[][])
    .then((inverse) => tf.tensor(inverse).matMul(X.transpose()))
    .then((pseudo) => pseudo.matMul(Y));
}

function predict(X: Tensor, theta: Tensor): Tensor {
  return X.transpose().matMul(theta).sum();
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

  function renderPoint(x: number, y: number, color = '#000') {
    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    );

    circle.setAttribute('fill', color);

    circle.setAttribute('cx', `${toWebX(x)}px`);
    circle.setAttribute('cy', `${toWebY(y)}px`);
    circle.setAttribute('r', `${5}px`);

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
