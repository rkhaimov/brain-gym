import { Field } from './types';
import { selectMines } from './mine';
import { intersection } from './collection';
import { allAsShown, selectShown } from './clicked';
import { selectFlagged } from './flagged';

export function withStatus(field: Field): Field {
  const mines = selectMines(field.cells);

  const clickedOnMines = intersection(selectShown(field.cells), mines);
  if (clickedOnMines.size > 0) {
    return {
      ...field,
      cells: allAsShown(field.cells),
      status: 'lost',
    };
  }

  const flaggedMines = intersection(selectFlagged(field.cells), mines);
  if (flaggedMines.size === mines.size) {
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
