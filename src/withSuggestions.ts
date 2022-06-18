import { Field, Point, SuggestedField } from './types';
import { allPointsInSpace } from './allPointsInSpace';
import { allPointsAround, hasPoint, intersect } from './point';

export function withSuggestions(field: Field): SuggestedField {
  return {
    ...field,
    suggestions: new Map(
      allPointsInSpace(field)
        .filter((point) => hasPoint(field.mines, point) === false)
        .map((point): [Point, number] => {
          const mines = intersect(allPointsAround(point), field.mines);

          return [point, mines.size];
        })
    ),
  };
}
