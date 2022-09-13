///<reference path="module.ts"/>

import * as tf from '@tensorflow/tfjs';
import { Tensor } from '@tensorflow/tfjs';
import Plotly from 'plotly.js-dist';
import * as math from 'mathjs';

void main();

async function main() {
  const X = times(10).map((_, index) => index);
  const Y = X.map((_, index) => index * 2);

  const Xt = tf
    .ones([X.length, 1])
    .concat(tf.tensor(X).reshape([X.length, 1]), 1);

  const Yt = tf.tensor(Y).reshape([Y.length, 1]);

  const theta = await learn(Xt, Yt);
  const [[b], [k]] = theta.arraySync() as number[][];

  document.body.innerHTML = '<div id="charts"></div>';
  Plotly.newPlot('charts', [
    {
      x: X,
      y: Y,
      type: 'scatter',
    },
    {
      x: tf.linspace(0, 10, 10).arraySync(),
      y: tf
        .linspace(0, 10, 10)
        .arraySync()
        .map((x) => b + x * k),
      type: 'scatter',
    },
  ]);
  // theta.print();
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

function times(n: number): number[] {
  return new Array(n).fill(0);
}
