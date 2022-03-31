export function times(count: number): number[] {
  return new Array(count).fill(null).map((_, index) => index);
}
