export type Brand<T, B extends string> = T & { [TKey in `__${B}`]: B };

export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}
