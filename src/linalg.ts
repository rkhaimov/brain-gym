export type Vector = number[];
export type Matrix = number[][];

function cosAngle(left: Vector, right: Vector): number {
  return dotProduct(left, right) / (l2(left) * l2(right));
}

function dotProduct(left: Vector, right: Vector): number {
  const dot = product(transpose(fromVector(left)), fromVector(right));

  return fold(dot, (_, n) => n, 0);
}

// Manhattan Norm
function l1(v: Vector): number {
  return v.map(Math.abs).reduce((r, v) => r + v);
}

// Euclidean Norm
function l2(v: Vector): number {
  const norm = product(transpose(fromVector(v)), fromVector(v));

  return Math.sqrt(fold(norm, (_, n) => n, 0));
}

function fromVector(v: Vector): Matrix {
  return v.map((x) => [x]);
}

function inverse(m: Matrix): Matrix {
  if (rows(m) !== cols(m)) {
    throw new Error();
  }

  return transform(identity(cols(m)), solve(m));

  function solve(
    m: Matrix,
    solutions: Transformation[] = []
  ): Transformation[] {
    if (isIdentity(m)) {
      return solutions;
    }

    const reason = findNonPivotOrZero(m);

    const transformation =
      reason.type === 'non-pivot'
        ? tmult(reason.row, 1 / m[reason.row][reason.col])
        : tplus(
          reason.row,
          reason.col,
          (-1 * m[reason.row][reason.col]) / m[reason.col][reason.col]
        );

    return solve(transform(m, [transformation]), [
      ...solutions,
      transformation,
    ]);
  }

  function findNonPivotOrZero(
    m: Matrix,
    col = 0
  ):
    | { type: 'non-zero'; row: number; col: number }
    | { type: 'non-pivot'; row: number; col: number } {
    if (m[col][col] !== 1) {
      return { type: 'non-pivot', row: col, col: col };
    }

    const nonZeroRow = m.findIndex((row, rowIndex) =>
      rowIndex === col ? false : row[col] !== 0
    );

    if (nonZeroRow !== -1) {
      return { type: 'non-zero', row: nonZeroRow, col };
    }

    return findNonPivotOrZero(m, col + 1);
  }

  function isIdentity(m: Matrix): boolean {
    return equals(identity(cols(m)), m);
  }
}

type Transformation = (matrix: Matrix) => Matrix;

function tswap(rowLeft: number, rowRight: number): Transformation {
  return (matrix) =>
    map(matrix, (n, r, col) => {
      if (r === rowLeft) {
        return matrix[rowRight][col];
      }

      if (r === rowRight) {
        return matrix[rowLeft][col];
      }

      return n;
    });
}

function tplus(row: number, fromRow: number, scalar: number): Transformation {
  return (matrix) =>
    map(matrix, (n, r, col) =>
      r === row ? n + matrix[fromRow][col] * scalar : n
    );
}

function tmult(row: number, scalar: number): Transformation {
  return (matrix) => map(matrix, (n, r, col) => (r === row ? n * scalar : n));
}

function transform(matrix: Matrix, transformations: Transformation[]): Matrix {
  return transformations.reduce((m, t) => t(m), matrix);
}

function scale(matrix: Matrix, scalar: number): Matrix {
  return map(matrix, (n) => n * scalar);
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

function equals(left: Matrix, right: Matrix): boolean {
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
  calc: (n: number, row: number, col: number) => number
): Matrix {
  const result: Matrix = [];

  matrix.forEach((row, ri) => {
    result[ri] = [];

    row.forEach((value, ci) => (result[ri][ci] = calc(value, ri, ci)));
  });

  return result;
}
