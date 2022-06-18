import {
  FlagsShownSuggestedField,
  Point,
  StatusFlagsShownSuggestedField,
} from './types';
import { intersect, points, union } from './point';

export function withStatus(
  field: FlagsShownSuggestedField,
  clicks: Point[],
  flags: Point[]
): StatusFlagsShownSuggestedField {
  if (intersect(points(clicks), field.mines).size > 0) {
    return {
      ...field,
      shown: union(field.shown, intersect(points(clicks), field.mines)),
      status: 'lost',
    };
  }

  if (intersect(points(flags), field.mines).size === field.mines.size) {
    return {
      ...field,
      status: 'win',
    };
  }

  return {
    ...field,
    status: 'playing',
  };
}
