import {
  Cell,
  CollectionOf,
  MineCell,
  Point,
  Size,
  SuggestCell,
} from './types';
import { exclude, filter, map } from './collection';
import { allPointsInSpace } from './allPointsInSpace';
import { allCellsAroundPoint } from './allCellsAroundPoint';

export function createSuggestions(
  size: Size,
  mines: CollectionOf<MineCell>
): CollectionOf<SuggestCell> {
  const nonMineCells = exclude(allPointsInSpace(size), mines);

  return map(nonMineCells, (point) => createSuggest(point, mines));
}

export function selectSuggestions(
  cells: CollectionOf<Cell>
): CollectionOf<SuggestCell> {
  // TODO: To type guard
  return filter(cells, isSuggestion) as CollectionOf<SuggestCell>;
}

export function isSuggestion(cell: Cell): cell is SuggestCell {
  return cell.kind === 'suggest';
}

function createSuggest(
  point: Point,
  mines: CollectionOf<MineCell>
): SuggestCell {
  const minesAround = allCellsAroundPoint(mines, point);

  return {
    kind: 'suggest',
    score: minesAround.size,
    shown: false,
    flagged: false,
  };
}
