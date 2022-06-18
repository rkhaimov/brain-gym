export type Field = Size & {
  cells: CollectionOf<Cell>;
  status: 'playing' | 'win' | 'lost';
};

export type CollectionOf<T> = Map<Point, T>;

export type Cell = MineCell | SuggestCell;

export type MineCell = ShowFlagged & {
  kind: 'mine';
};

export type SuggestCell = ShowFlagged & {
  kind: 'suggest';
  score: number;
};

type ShowFlagged =
  | { shown: true; flagged: false }
  | { shown: false; flagged: boolean };

export type Size = { width: number; height: number };

export type Point = string;
