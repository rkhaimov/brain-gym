import { Point } from './types';
import { range } from './range';

export function hasPoint(
  points: { has(p: Point): boolean },
  point: Point
): boolean {
  return points.has(point);
}

export function lookupPoint<T>(points: Map<Point, T>, point: Point): T {
  const found = points.get(point);

  if (found === undefined) {
    throw new Error();
  }

  return found;
}

export function allPointsAround(point: Point, angle = Math.PI / 4): Set<Point> {
  return points(
    range((2 * Math.PI) / angle).map((factor) => {
      const sin = Math.round(Math.sin(angle * factor));
      const cos = Math.round(Math.cos(angle * factor));

      return createPoint(getX(point) + cos, getY(point) + sin);
    })
  );
}

export function intersect(left: Set<Point>, right: Set<Point>): Set<Point> {
  return points(
    [...Array.from(left), ...Array.from(right)].filter(
      (element) => left.has(element) && right.has(element)
    )
  );
}

export function exclude(left: Set<Point>, right: Set<Point>): Set<Point> {
  return points(
    Array.from(left).filter((element) => right.has(element) === false)
  );
}

export function union(left: Set<Point>, right: Set<Point>): Set<Point> {
  return points([...Array.from(left), ...Array.from(right)]);
}

export function fromKeys(map: Map<Point, unknown>): Set<Point> {
  return new Set<Point>(map.keys());
}

export function points(points: Point[]): Set<Point> {
  return new Set<Point>(points);
}

export function createPoint(x: number, y: number): Point {
  return `${x}X${y}`;
}

function getX(point: Point): number {
  return parseInt(point.split('X')[0]);
}

function getY(point: Point): number {
  return parseInt(point.split('X')[1]);
}
