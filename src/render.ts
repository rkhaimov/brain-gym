import Chart from 'chart.js/auto';
import { ChartConfiguration } from 'chart.js';

document.body.innerHTML =
  '<canvas id="chart" width="1000" height="400"></canvas>';

const canvas = document.querySelector('#chart') as HTMLCanvasElement;

export function render(x: number[], f: (x: number) => number) {
  return new Chart(canvas, {
    data: {
      labels: x,
      datasets: [
        {
          type: 'line',
          data: x.map(f),
          backgroundColor: 'blue',
          borderColor: 'blue',
          label: 'f(x)',
          pointRadius: 0,
        },
        {
          type: 'scatter',
          label: 'steps',
          pointRadius: 5,
          data: [],
          backgroundColor: 'rgb(53,153,12)',
        },
      ],
    },
  } as ChartConfiguration<'line' | 'scatter'>);
}

export function point(
  chart: ReturnType<typeof render>,
  point: Record<'x' | 'y', number>
) {
  chart.data.datasets[1].data.push(point);

  chart.update();
}
