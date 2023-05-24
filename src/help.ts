// Type is a set
// k is an element of that set
declare const n0: number

// Assigment succeeds only when a value belongs to given set (or type)
const n1: number = 1;

// Sets can vary in size. It often will be infinite, but in some cases there is a limit
// Only -1 is assignable, because it is the only element in this set
const n2: -1 = -1;

// Multiple "values" can be united in one set
const n3: -1 | 2 | 3 = 2;

// String are not an exception
declare const s0: string;

// Particular string can be assigned
const s1: 'particular string' = 'particular string';
const s2: 'particular string' | 'one' = 'one';
const s_2: string = s2;

// Not only values can be united, but types (or sets) as well
declare let stringOrNumber: number | string;

stringOrNumber = 1;
stringOrNumber = '1';

// We can operate on them only with functions, defined for numbers
// For example f maintains type, it is called CLOSURE property
declare const f: (l: number | string) => string;
const s3 = f(stringAndNumber)

// Types can be intersected
declare let stringAndNumber: number & string;

// Never is equal to an empty set
stringAndNumber = '1'
stringAndNumber = 1

// Never is a subtype of any type
const s: string & number = stringAndNumber;

declare let t0: number | never;
declare let t1: number & never;

// Function can not be executed
type WhatAwaitsUsAfterDeath = 1;
declare const absurd: (a: never) => WhatAwaitsUsAfterDeath;

// It never ends its execution
declare const hang: () => never;

// Because it never ends, caller can return anything
function hello(): number {
  hang()
}

absurd(hang())

const hangImpl = (): never => {
  return hangImpl();
}

// void
const v: void = undefined;

declare const t2: string | void;
declare const t3: string & void;

// unknown
declare let u: unknown;
