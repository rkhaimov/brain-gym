import { Field, Size } from './types';
import { createRandomMines } from './mine';
import { createSuggestions } from './suggest';
import { union } from './collection';

export function createField(size: Size): Field {
  const mines = createRandomMines(size);
  const suggestions = createSuggestions(size, mines);

  return {
    ...size,
    cells: union(mines, suggestions),
    status: 'playing',
  };
}
