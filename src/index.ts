import { Tensor } from '@tensorflow/tfjs';
///<reference path="module.ts"/>
import Plotly from 'plotly.js-dist';

document.body.innerHTML = '<div id="charts"></div>';

void main();

async function main() {
  Plotly.newPlot('charts', []);
}

function lines(tensor: Tensor, color: string) {
  const list = tensor.arraySync() as number[][];

  return {
    x: list.map(([x]) => x),
    y: list.map(([, y]) => y),
    mode: 'line',
    line: {
      color,
    },
  };
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
