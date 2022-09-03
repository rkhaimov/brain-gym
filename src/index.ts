import { fromVector, Matrix, mproduct, mscale, transpose } from './linalg';
import { l2, mvproduct, Vector } from './vector';

const { drawVector, drawPoint, drawSpace } = createDrawers();

const a: Vector = [3 * 80, 2 * 80];
const b: Vector = [3 * 100, 0.5 * 100];

drawVector(a, 'blue');
drawVector(b);

const P = mscale(
  mproduct(fromVector(b), transpose(fromVector(b))),
  1 / Math.pow(l2(b), 2)
);

drawVector(mvproduct(P, a), 'yellow');

function createDrawers() {
  document.querySelector('html')!.style.height = '100%';
  document.body.style.height = '100%';
  document.body.style.margin = '0';

  document.body.innerHTML = `
  <svg id='canvas' xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'>
      <defs>
        <marker id='arrowhead' markerWidth='5' markerHeight='5' 
        refX='0' refY='1' orient='auto'>
          <rect fill='red' height='2' width='2'></rec
        </marker>
      </defs>
    </svg>
  `;

  const canvas = document.querySelector('#canvas') as HTMLElement;

  drawAxis();

  return {
    drawVector,
    drawPoint,
    drawSpace,
  };

  function drawSpace(matrix: Matrix, color?: string) {
    const xs = new Array(100).fill(0).map((_, index) => (index - 50) * 10);
    const ys = new Array(100).fill(0).map((_, index) => (index - 50) * 10);

    xs.forEach((x) =>
      ys.forEach((y) => {
        const v = mproduct(matrix, fromVector([x, y]));

        return drawPoint(
          v.map((row) => row[0]),
          color
        );
      })
    );
  }

  function drawAxis() {
    const xl = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    xl.setAttribute('x1', '0');
    xl.setAttribute('y1', `${toWebY(0)}px`);
    xl.setAttribute('stroke', 'gray');
    xl.setAttribute('stroke-width', '1');

    xl.setAttribute('x2', `${window.outerWidth}px`);
    xl.setAttribute('y2', `${toWebY(0)}px`);

    const yl = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    yl.setAttribute('x1', `${toWebX(0)}px`);
    yl.setAttribute('y1', '0');
    yl.setAttribute('stroke', 'gray');
    yl.setAttribute('stroke-width', '1');

    yl.setAttribute('x2', `${toWebX(0)}px`);
    yl.setAttribute('y2', `${window.outerHeight}px`);

    canvas.appendChild(xl);
    canvas.appendChild(yl);
  }

  function drawPoint(v: Vector, color = '#000') {
    const [x, y] = v;

    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    );

    circle.setAttribute('fill', color);

    circle.setAttribute('cx', `${toWebX(x)}px`);
    circle.setAttribute('cy', `${toWebY(y)}px`);
    circle.setAttribute('r', '5px');

    canvas.appendChild(circle);
  }

  function drawVector(v: Vector, color = '#000') {
    const [x, y] = v;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    line.setAttribute('x1', `${toWebX(0)}`);
    line.setAttribute('y1', `${toWebY(0)}`);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '3');
    line.setAttribute('marker-end', 'url(#arrowhead)');

    line.setAttribute('x2', `${toWebX(x)}px`);
    line.setAttribute('y2', `${toWebY(y)}px`);

    text.setAttribute('x', `${toWebX(x)}px`);
    text.setAttribute('y', `${toWebY(y)}px`);
    text.textContent = `[${x}, ${y}]`;

    canvas.appendChild(line);
    // canvas.appendChild(text);
  }

  function toWebX(x: number) {
    return x + window.outerWidth / 2;
  }

  function toWebY(y: number) {
    return window.outerHeight / 2 - y;
  }
}
