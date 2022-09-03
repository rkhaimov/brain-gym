import { cols, equals, identity, map, Matrix, rows } from './linalg';

export function inverse(m: Matrix): Matrix {
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
