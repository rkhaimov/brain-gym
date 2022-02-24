import { Circle, Line, Point, Shape } from './types';
import { translate, xmax, xmin } from './coord';
import { linePointByX } from './constructors';

export const createDrawer = () => {
  const canvas = document.createElement('canvas');

  document.body.style.height = '100vh';
  document.body.style.margin = '0';

  canvas.width = document.body.getBoundingClientRect().width;
  canvas.height = document.body.getBoundingClientRect().height;

  document.body.appendChild(canvas);

  const context = canvas.getContext('2d') as CanvasRenderingContext2D;

  const drawPoint = (point: Point) => {
    context.beginPath();
    context.arc(translate(point).x, translate(point).y, 5, 0, Math.PI * 2);
    context.lineWidth = 2;
    context.stroke();
    context.fill();
    context.closePath();
  };

  const drawLine = (line: Line) => {
    const pfrom = linePointByX(line, xmin());
    const pto = linePointByX(line, xmax());

    context.beginPath();
    context.moveTo(translate(pfrom).x, translate(pfrom).y);
    context.lineTo(translate(pto).x, translate(pto).y);
    context.stroke();
    context.closePath();
  };

  const drawCircle = ({ center, radius }: Circle) => {
    drawPoint(center);

    context.beginPath();
    context.arc(
      translate(center).x,
      translate(center).y,
      radius,
      0,
      Math.PI * 2
    );
    context.stroke();
    context.closePath();
  };

  return {
    clear: () => context.clearRect(0, 0, window.innerWidth, window.innerHeight),
    draw: (shape: Shape) => {
      if (shape.tag === 'point') {
        drawPoint(shape);
      }

      if (shape.tag === 'line') {
        drawLine(shape);
      }

      if (shape.tag === 'circle') {
        drawCircle(shape);
      }
    },
  };
};
