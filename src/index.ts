import * as tf from '@tensorflow/tfjs';
import { Tensor } from '@tensorflow/tfjs';
///<reference path="module.ts"/>
import Plotly from 'plotly.js-dist';

document.body.innerHTML = '<div id="charts"></div>';

void main();

async function main() {
  const data = classification();

  const X = data.slice([0, 0], [-1, 2]);
  const Y = data.slice([0, 2], [-1, 1]);

  const left = await tf.booleanMaskAsync(data, Y.toBool().reshape([-1]));

  const right = await tf.booleanMaskAsync(
    data,
    Y.toBool().logicalNot().reshape([-1])
  );

  Plotly.newPlot('charts', [markers(left, 'red'), markers(right, 'blue')]);
}

function markers(tensor: Tensor, color: string) {
  const list = tensor.arraySync() as number[][];

  return {
    x: list.map(([x]) => x),
    y: list.map(([, y]) => y),
    mode: 'markers',
    marker: {
      color,
    },
  };
}

function times(n: number): number[] {
  return new Array(n).fill(0).map((_, index) => index);
}

function classification() {
  const total = 25;

  const coords = times(total).flatMap((x) =>
    times(total).map((y) => [x, y, x + y < 25 ? 1 : 0])
  );

  return tf.tensor2d(coords);
}
