export function assert<TCondition>(
  condition: TCondition,
  message: string = 'Assertion has been failed'
): asserts condition {
  if (condition) {
    return;
  }

  throw new Error(message);
}

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
