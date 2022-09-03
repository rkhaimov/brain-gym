import { fold, fromVector, Matrix, mproduct, transpose } from './linalg';

export type Vector = number[];

export function vscale(v: Vector, scalar: number): Vector {
  return v.map((n) => n * scalar);
}

export function mvproduct(m: Matrix, v: Vector): Vector {
  return mproduct(m, fromVector(v)).map((row) => row[0]);
}

export function sum(left: Vector, right: Vector): Vector {
  return left.map((_, i) => left[i] + right[i]);
}

export function dproduct(left: Vector, right: Vector): number {
  const dot = mproduct(transpose(fromVector(left)), fromVector(right));

  return fold(dot, (_, n) => n, 0);
}

// Manhattan Norm
function l1(v: Vector): number {
  return v.map(Math.abs).reduce((r, v) => r + v);
}

// Euclidean Norm
export function l2(v: Vector): number {
  const norm = mproduct(transpose(fromVector(v)), fromVector(v));

  return Math.sqrt(fold(norm, (_, n) => n, 0));
}
