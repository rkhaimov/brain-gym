import { CollectionOf, Point, Size } from './types';
import { range } from './utils';
import { createPoint } from './point';

export function allPointsInSpace(size: Size): CollectionOf<Point> {
  return new Map<Point, Point>(
    range(size.width).flatMap((x): [Point, Point][] =>
      range(size.height).map((y): [Point, Point] => [
        createPoint(x, y),
        createPoint(x, y),
      ])
    )
  );
}
