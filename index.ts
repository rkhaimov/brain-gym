addLine({x: 0, y: 0}, {x: 200, y: 200});

function addLine(_from: Point, _to: Point) {
  const from = convertPoint(_from);
  const to = convertPoint(_to);

  const canvas = document.querySelector('.canvas');

  assert(canvas);

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line') as unknown as SVGLineElement;

  line.style.stroke = 'rgb(255,0,0)';
  line.style.strokeWidth = '2';

  line.setAttribute('x1', `${from.x}`);
  line.setAttribute('y1', `${from.y * -1}`);

  line.setAttribute('x2', `${to.x}`);
  line.setAttribute('y2', `${to.y * -1}`);

  canvas.appendChild(line);
}

function convertPoint(point: Point) {
  point.x = point.x + window.innerWidth / 2;
  point.y = (point.y + window.innerHeight / 2) * -1;

  return point;
}

function assert<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(`Expected 'val' to be defined, but received ${val}`);
  }
}

type Point = {
  x: number;
  y: number;
};
