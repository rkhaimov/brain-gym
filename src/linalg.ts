type Matrix = number[][];

// Vector is special kind of matrix with one column
export type Vector = [number][];

export function vector(v: number[]): Vector {
  return v.map((x) => [x]);
}

// Manhattan Norm
function l1(v: Vector): number {
  return fold(
    map(v, (value) => Math.abs(value)),
    (r, v) => r + v,
    0
  );
}

// Euclidean Norm
function l2(v: Vector): number {
  return Math.sqrt(fold(product(transpose(v), v), (_, n) => n, 0));
}

function scale(m: Matrix, scalar: number): Matrix {
  return map(m, (n) => scalar * n);
}

function product(left: Matrix, right: Matrix): Matrix {
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

function rows(m: Matrix): number {
  return m.length;
}

function cols(m: Matrix): number {
  return m[0].length;
}

function toString(m: Matrix): string {
  return m.map((row) => row.join(', ')).join('\n');
}

function transpose(matrix: Matrix): Matrix {
  return map(zeros(cols(matrix), rows(matrix)), (_, m, n) => matrix[n][m]);
}

function identity(size: number): Matrix {
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

function fold<T>(
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

function map(
  matrix: Matrix,
  calc: (value: number, m: number, n: number) => number
): Matrix {
  const result: Matrix = [];

  matrix.forEach((row, m) => {
    result[m] = [];

    row.forEach((value, n) => (result[m][n] = calc(value, m, n)));
  });

  return result;
}
