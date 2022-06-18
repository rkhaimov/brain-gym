import { Cell, CollectionOf, Field, Point, SuggestCell } from './types';
import { isMineAtPoint } from './mine';
import {
  exclude,
  filter,
  flatMap,
  lookupOne,
  map,
  one,
  union,
} from './collection';
import { isSuggestion, selectSuggestions } from './suggest';
import { assert } from './utils';
import { allCellsAroundPoint } from './allCellsAroundPoint';

export function clicked(field: Field, click: Point): Field {
  if (isMineAtPoint(field.cells, click)) {
    const mine = one(click, lookupOne(field.cells, click));

    return {
      ...field,
      cells: union(field.cells, allAsShown(mine)),
    };
  }

  return obviousAsShown({
    ...field,
    cells: union(field.cells, clickedAsShown(click, field)),
  });
}

function clickedAsShown(
  clickedOn: Point,
  field: Field
): CollectionOf<SuggestCell> {
  const suggestion = lookupOne(field.cells, clickedOn);

  assert(isSuggestion(suggestion));

  return allAsShown(one(clickedOn, suggestion));
}

function obviousAsShown(field: Field): Field {
  const shownCells = selectShown(field.cells);
  const shownSuggestions = selectShown(selectSuggestions(field.cells));

  const zeroSuggestions = filter(
    shownSuggestions,
    (suggestion) => suggestion.score === 0
  );

  const cellsAroundZero = flatMap(zeroSuggestions, (_, point) =>
    allCellsAroundPoint(field.cells, point)
  );

  const hiddenCells = exclude(cellsAroundZero, shownCells);

  // Nothing to show
  if (hiddenCells.size === 0) {
    return field;
  }

  return obviousAsShown({
    ...field,
    cells: union(field.cells, allAsShown(hiddenCells)),
  });
}

export function allAsShown<T extends Cell>(cells: CollectionOf<T>): CollectionOf<T> {
  return map(cells, (cell) => ({ ...cell, shown: true, flagged: false }));
}

export function selectShown<T extends Cell>(
  cells: CollectionOf<T>
): CollectionOf<T> {
  return filter(cells, (cell) => cell.shown);
}
