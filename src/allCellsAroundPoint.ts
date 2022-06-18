import { Cell, CollectionOf, Point } from './types';
import { lookupMany } from './collection';
import { range } from './utils';
import { createPoint, getX, getY } from './point';

export function allCellsAroundPoint<T extends Cell>(
  collection: CollectionOf<T>,
  point: Point
): CollectionOf<T> {
  const angle = Math.PI / 4;

  return lookupMany(
    collection,
    new Set<Point>(
      range((2 * Math.PI) / angle).map((factor) => {
        const sin = Math.round(Math.sin(angle * factor));
        const cos = Math.round(Math.cos(angle * factor));

        return createPoint(getX(point) + cos, getY(point) + sin);
      })
    )
  );
}
