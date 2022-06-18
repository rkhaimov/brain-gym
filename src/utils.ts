export function range(n: number): number[] {
  return new Array(n).fill(null).map((_, index) => index);
}

export function not(predicate: boolean) {
  return !predicate;
}

export function assert<T>(condition: T): asserts condition {
  if (condition) {
    return;
  }

  throw new Error('Condition has failed');
}
