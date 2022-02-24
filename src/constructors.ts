import { Circle, Line, Point } from './types';
import { Optional } from './optional';

export const point = (x: number, y: number): Point => ({ tag: 'point', x, y });

export const line = (from: Point, to: Point): Line => ({
  tag: 'line',
  from,
  to,
});

export const circle = (center: Point, radius: number): Circle => ({
  tag: 'circle',
  center,
  radius,
});

export const circlePointByRad = (circle: Circle, at: number): Point => {
  return point(
    circle.center.x + circle.radius * Math.cos(at),
    circle.center.y + circle.radius * Math.sin(at)
  );
};

export const linePointByX = (line: Line, x: number): Point => {
  return point(x, x * slope(line) + bias(line));
};

const bias = (line: Line): number => line.from.y;
const slope = ({ from, to }: Line): number => (to.y - from.y) / (to.x - from.x);

export const lineIntr = (a: Line, b: Line): Optional<Point> => {
  if (slope(a) === slope(b)) {
    return Optional.none();
  }

  const intx = (bias(b) - bias(a)) / (slope(a) - slope(b));

  return Optional.some(linePointByX(a, intx));
};

export const circleAtLineByX = (
  line: Line,
  x: number,
  radius: number
): Circle => {
  const center = linePointByX(line, x);

  return circle(center, radius);
};
