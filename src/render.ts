import { Point } from './point';

export function renderBody() {
  document.body.style.position = 'relative';
  document.body.style.margin = '0';
  document.body.style.height = '100vh';
}

export const renderPoint =
  (color: string, radius: number, index: number) =>
  (point: Point): void => {
    const circle = document.createElement('div');

    circle.style.position = 'absolute';
    circle.style.top = `${point.y}px`;
    circle.style.left = `${point.x}px`;
    circle.style.zIndex = `${index}`;

    circle.style.display = 'inline-block';
    circle.style.backgroundColor = color;
    circle.style.width = `${radius}px`;
    circle.style.height = `${radius}px`;
    circle.style.borderRadius = '50%';
    circle.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(circle);
  };
