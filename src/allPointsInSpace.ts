import { Point, Size } from './types';
import { range } from './range';
import { createPoint } from './point';

export function allPointsInSpace(size: Size): Point[] {
  return range(size.width).flatMap((x): Point[] =>
    range(size.height).map((y) => createPoint(x, y))
  );
}
