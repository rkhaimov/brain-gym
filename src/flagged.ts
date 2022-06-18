import { Cell, CollectionOf, Field, Point } from './types';
import { filter, lookupOne, one, union } from './collection';
import { assert, not } from './utils';

export function flagged(field: Field, flag: Point): Field {
  const toBeFlagged = lookupOne(field.cells, flag);

  assert(not(toBeFlagged.shown));

  return {
    ...field,
    cells: union(
      field.cells,
      one(
        flag,
        toBeFlagged.flagged ? asUnFlagged(toBeFlagged) : asFlagged(toBeFlagged)
      )
    ),
  };
}

export function selectFlagged<T extends Cell>(
  cells: CollectionOf<T>
): CollectionOf<T> {
  return filter(cells, (cell) => cell.flagged);
}

function asFlagged(cell: Cell): Cell {
  return { ...cell, flagged: true, shown: false };
}

function asUnFlagged(cell: Cell): Cell {
  return { ...cell, flagged: false };
}
