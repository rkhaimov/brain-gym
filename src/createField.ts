import { Field, Mine, Point, Size } from './types';
import { createMine } from './createMine';
import { createPoint, hasPoint } from './point';

export function createField(size: Size): Field {
  return {
    ...size,
    mines: randomMines(size),
  };
}

function randomMines(size: Size, placed: Set<Mine> = new Set()): Set<Mine> {
  const count = Math.floor(size.height * size.height * (1 / 3));

  if (count === placed.size) {
    return placed;
  }

  const mine = createMine(randomPoint(size));

  if (hasPoint(placed, mine)) {
    return randomMines(size, placed);
  }

  return randomMines(size, placed.add(mine));
}

function randomPoint(size: Size): Point {
  return createPoint(
    Math.min(Math.floor(Math.random() * size.width), size.width - 1),
    Math.min(Math.floor(Math.random() * size.height), size.height - 1)
  );
}
