import { FlagsShownSuggestedField, Point, ShownSuggestedField } from './types';
import { exclude, points } from './point';

export function withFlags(
  field: ShownSuggestedField,
  holds: Point[]
): FlagsShownSuggestedField {
  return {
    ...field,
    flags: exclude(points(holds), field.shown),
  };
}
