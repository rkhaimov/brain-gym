import { Point, ShownSuggestedField, SuggestedField } from './types';
import {
  allPointsAround,
  exclude,
  fromKeys,
  hasPoint,
  intersect,
  points,
  union,
} from './point';

export function withShown(
  field: SuggestedField,
  clicks: Point[]
): ShownSuggestedField {
  return {
    ...field,
    shown: clicks.reduce(
      (result, click) => union(points([]), propagateShown(click, field)),
      points([])
    ),
  };
}

function propagateShown(
  click: Point,
  field: SuggestedField,
  visited = points([])
): Set<Point> {
  if (hasPoint(field.mines, click)) {
    return points([]);
  }

  const suggestions = exclude(
    intersect(allPointsAround(click, Math.PI / 2), fromKeys(field.suggestions)),
    visited
  );

  return union(
    visited,
    Array.from(suggestions).reduce(
      (result, suggest) =>
        union(
          result,
          propagateShown(suggest, field, union(visited, suggestions))
        ),
      points([])
    )
  );
}
