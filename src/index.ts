type AreEqual<A, B> = A extends B ? (B extends A ? true : false) : false;

declare const expect: <T extends true>() => void;

declare const identity: <T>(input: T) => T;

interface Compose {
  <A, B, C>(g: (x: B) => C, f: (x: A) => B): (x: A) => C;

  <A, B, C, D>(h: (x: C) => D, g: (x: B) => C, f: (x: A) => B): (x: A) => D;
}

declare const compose: Compose;

declare const numberToString: (n: number) => string;
declare const stringToNumber: (s: string) => number;

const nToN = compose(stringToNumber, numberToString);
const sToS = compose(numberToString, stringToNumber);

expect<AreEqual<typeof nToN, typeof identity<number>>>();
expect<AreEqual<typeof sToS, typeof identity<string>>>();
