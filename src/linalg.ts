import { Vector } from './vector';

export type Matrix = number[][];

export function fromVector(v: Vector): Matrix {
  return v.map((x) => [x]);
}

export function mscale(m: Matrix, scalar: number): Matrix {
  return map(m, (n) => scalar * n);
}

export function mproduct(left: Matrix, right: Matrix): Matrix {
  if (cols(left) !== rows(right)) {
    throw new Error();
  }

  const m = rows(left);
  const n = cols(right);

  return map(zeros(m, n), (n, row, col) =>
    left[row]
      .map((value, index) => value * transpose(right)[col][index])
      .reduce((a, b) => a + b)
  );
}

function sum(left: Matrix, right: Matrix): Matrix {
  if (rows(left) !== rows(right)) {
    throw new Error();
  }

  if (cols(left) !== cols(right)) {
    throw new Error();
  }

  const m = rows(left);
  const n = cols(left);

  return map(zeros(m, n), (n, row, col) => left[row][col] + right[row][col]);
}

export function rows(m: Matrix): number {
  return m.length;
}

export function cols(m: Matrix): number {
  return m[0].length;
}

export function toString(m: Matrix): string {
  return m.map((row) => row.join(', ')).join('\n');
}

export function transpose(matrix: Matrix): Matrix {
  return map(zeros(cols(matrix), rows(matrix)), (_, m, n) => matrix[n][m]);
}

export function identity(size: number): Matrix {
  return map(zeros(size, size), (n, row, col) => (row === col ? 1 : 0));
}

function zeros(rows: number, cols: number): Matrix {
  if (rows === 0) {
    return [];
  }

  if (cols === 0) {
    return [];
  }

  const row = new Array(cols).fill(0);

  return [row, ...zeros(rows - 1, cols)];
}

export function equals(left: Matrix, right: Matrix): boolean {
  if (rows(left) !== rows(right)) {
    return false;
  }

  if (cols(left) !== cols(right)) {
    return false;
  }

  const score = fold(
    map(zeros(rows(left), cols(left)), (_, m, n) =>
      left[m][n] === right[m][n] ? 0 : 1
    ),
    (seed, value) => seed + value,
    0
  );

  return score === 0;
}

export function fold<T>(
  matrix: Matrix,
  combine: (seed: T, value: number, row: number, col: number) => T,
  seed: T
): T {
  let result = seed;

  map(matrix, (n, row, col) => {
    result = combine(result, n, row, col);

    return n;
  });

  return result;
}

export function map(
  matrix: Matrix,
  calc: (n: number, row: number, col: number) => number
): Matrix {
  const result: Matrix = [];

  matrix.forEach((row, ri) => {
    result[ri] = [];

    row.forEach((value, ci) => (result[ri][ci] = calc(value, ri, ci)));
  });

  return result;
}
