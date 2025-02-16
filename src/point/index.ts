import { Time } from '../ticker/types';
import { DynamicPoint, Point, WithTransform } from './types';

/**
 * Creates a new DynamicPoint with the given initial state.
 *
 * @param point - The initial state of the point when time is zero.
 * @returns A new DynamicPoint.
 */
export function createDynamicPoint(point: Point): DynamicPoint {
  const transformations: Array<WithTransform> = [];

  const dp: DynamicPoint = {
    with: (transform) => {
      transformations.push(transform);

      return dp;
    },
    start: (ticker, onUpdate) =>
      ticker.start((time) => onUpdate(unfold(transformations, point, time))),
  };

  return dp;
}

function unfold(
  transformations: Array<WithTransform>,
  point: Point,
  time: Time,
): Point {
  if (transformations.length === 0) {
    return point;
  }

  const [transform, ...rest] = transformations;

  const transformed = transform(point, time);

  if (typeof transformed === 'object') {
    return unfold(rest, transformed, time);
  }

  return unfold([transformed, ...rest], point, time);
}
