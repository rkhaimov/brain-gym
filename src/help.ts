type NoRedReturn<T> = T extends 'red' ? never : T;

function noRedOrWillThrow<T>(input: T) {
  if (input === 'red') {
    throw new Error('Red was given');
  }

  return input as NoRedReturn<T>;
}

declare const n: 'red' | 'blue' | 'green';

type Q = NoRedReturn<typeof n>;

const r = noRedOrWillThrow(n);
