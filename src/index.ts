// 2048
type NaturalNumber = number & { __brand: 'NaturalNumber' };
type Size = NaturalNumber;

type Row = Cell[];
type Field = {
  rows: Row[];
};

type Cell = {
  power: NaturalNumber;
};

enum MoveVector {
  Up,
  Right,
  Down,
  Left,
}

const field = createField(natural(3));
const field_0 = move(field, MoveVector.Down);

console.log(field.rows);
console.log(field_0.rows);

function move(field: Field, vector: MoveVector): Field {
  return { rows: [] };
}

function rotate(rows: Row[], degrees: number): Row[] {}

function combineR(left: Row, right: Row): [Row, Row] {
  return unzip(
    zip(left, right).map(([lcell, rcell]) => {
      if (combinable(lcell, rcell)) {
        return [combineC(lcell, rcell), cell(zero())];
      }

      return [lcell, rcell];
    })
  );
}

function combineC(left: Cell, right: Cell): Cell {
  assert(combinable(left, right));

  if (left.power === zero()) {
    return cell(right.power);
  }

  if (right.power === zero()) {
    return cell(left.power);
  }

  return cell(increment(left.power));
}

function combinable(left: Cell, right: Cell): boolean {
  return (
    left.power === right.power ||
    left.power === zero() ||
    right.power === zero()
  );
}

function createField(size: Size): Field {
  return {
    rows: times(size).map(() => times(size).map(() => createRandomCell())),
  };
}

function createRandomCell(): Cell {
  return cell(
    sample([
      natural(0),
      natural(0),
      natural(0),
      natural(0),
      natural(0),
      natural(0),
      natural(1),
      natural(2),
    ])
  );
}

function cell(power: NaturalNumber): Cell {
  return { power };
}

function zip<TElement>(
  left: TElement[],
  right: TElement[]
): [TElement, TElement][] {
  assert(left.length === right.length);

  return left.map((l, index) => [l, right[index]]);
}

function unzip<TElement>(
  list: [TElement, TElement][]
): [TElement[], TElement[]] {
  return [list.map(([f]) => f), list.map(([, s]) => s)];
}

function times(count: NaturalNumber): NaturalNumber[] {
  return range(zero(), count);
}

function range(from: NaturalNumber, to: NaturalNumber): NaturalNumber[] {
  if (from === to) {
    return [];
  }

  return [from, ...range(increment(from), to)];
}

function increment(n: NaturalNumber): NaturalNumber {
  return natural(n + 1);
}

function decrement(n: NaturalNumber): NaturalNumber {
  return natural(n - 1);
}

function zero(): NaturalNumber {
  return natural(0);
}

function natural(n: number): NaturalNumber {
  return n as NaturalNumber;
}

function sample<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function assert(condition: unknown): asserts condition {
  if (condition) {
    return;
  }

  throw new Error('Not true');
}
