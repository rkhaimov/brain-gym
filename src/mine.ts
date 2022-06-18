import { Cell, CollectionOf, MineCell, Point, Size } from './types';
import { empty, filter, one, union } from './collection';
import { createPoint } from './point';

export function createRandomMines(
  size: Size,
  placed: CollectionOf<MineCell> = empty()
): CollectionOf<MineCell> {
  const count = Math.floor(size.height * size.height * (1 / 5));

  if (count === placed.size) {
    return placed;
  }

  const mine = createMine(randomPoint(size));

  return createRandomMines(size, union(placed, mine));
}

function randomPoint(size: Size): Point {
  return createPoint(
    Math.min(Math.floor(Math.random() * size.width), size.width - 1),
    Math.min(Math.floor(Math.random() * size.height), size.height - 1)
  );
}

function createMine(point: Point): CollectionOf<MineCell> {
  return one(point, { kind: 'mine', shown: false, flagged: false });
}

export function selectMines(cells: CollectionOf<Cell>): CollectionOf<MineCell> {
  return filter(
    cells,
    (cell) => cell.kind === 'mine'
  ) as CollectionOf<MineCell>;
}

// TODO: Lookup should be here
export function isMineAtPoint(
  cells: CollectionOf<Cell>,
  point: Point
): boolean {
  const cell = cells.get(point);

  if (cell) {
    return cell.kind === 'mine';
  }

  return false;
}
