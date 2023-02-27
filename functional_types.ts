type Apple = {
  sweetness: number;
  color: string;
};

// Duplication
function createApple(sweetness: number) {
  return {sweetness, color: 'blue'};
}

declare const t0: typeof createApple;

type Apple0 = ReturnType<typeof createApple>;

function createRedApple(sweetness: number) {
  return {sweetness, color: 'red' as const};
}

function createBlueApple(sweetness: number) {
  return {sweetness, color: 'blue' as const};
}

type RedApple = ReturnType<typeof createRedApple>;
type BlueApple = ReturnType<typeof createBlueApple>;

type GardenApple = RedApple | BlueApple;

declare const t2: GardenApple;

function infectWithWorm(apple: GardenApple) {
  return {...apple, worm: 'Jimmy'};
}

infectWithWorm(createRedApple(10));

type InfectedApple = ReturnType<typeof infectWithWorm>;

function nopeWhenRed(color: GardenApple['color']) {
  if (color === 'red') {
    return 'NOPE';
  }

  return color;
}

function nopeWhenRed0<T extends string>(color: T) {
  if (color === 'red') {
    return 'NOPE';
  }

  return color as Exclude<T, 'red'>;
}

declare const t3: 'red' | 'blue' | 'green' | 'purple'

nopeWhenRed0(t3)

declare const t4: Exclude<1 | 2 | 3 | 4, unknown>;
declare const t5: Exclude<{ name: string } | { surname: string }, { name?: string }>;

type Identity<T> = T;

declare const t6: Identity<1 | 2 | 3>;

type OnlyNumbers0<T> = T extends number ? T : never;

declare const t7: OnlyNumbers0<1 | 2 | 3 | '222'>;

type OnlyNumbers1<T> = T extends number ? T : never;

declare const t8: OnlyNumbers1<1 | 'string'>;

// Expand
declare const t9: 1 | never;

// Try to implement differently
type MyExtract<TCandidate, TPattern> = TCandidate extends TPattern ? TCandidate : never;
type MyExclude<TCandidate, TPattern> = TCandidate extends TPattern ? never : TCandidate;

declare const t10: MyExclude<1 | 2 | 3, 2 | 3 | 10>;

function toOnlyRedApples0(apples: Array<GardenApple>): Array<RedApple> {
  const result: Array<RedApple> = [];

  for (const apple of apples) {
    if (isRedApple(apple)) {
      result.push(apple);
    }
  }

  return result;
}

function toOnlyRedApples1(apples: Array<GardenApple>): Array<RedApple> {
  return apples.filter(isRedApple);
}

function isRedApple(apple: GardenApple): apple is RedApple {
  return apple.color === 'red';
}

function hang(): never {
  return hang();
}

function ensureIsRedApple(apple: GardenApple) {
  if (isRedApple(apple)) {
    return apple;
  }

  return hang();
}

declare const t11: GardenApple;

const redApple = ensureIsRedApple(t11);

assertIsRedApple(t11)

t11;

function assertIsRedApple(apple: GardenApple): asserts apple is RedApple {
  if (!isRedApple(apple)) {
    throw new Error('Not Red!!!')
  }
}

// number string
// brands using classes and tags
// | &
// value assignment
// type assertions
// struct type
// literal types
// void
// unknown
// never
// generics
// constraints
// in out
// type narrowing
// mapped types
// conditions
// inferable
// tuples
