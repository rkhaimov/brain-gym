export function range(n: number): number[] {
  return new Array(n).fill(null).map((_, index) => index);
}
