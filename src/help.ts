//<editor-fold desc="helpers">
const isMemberOf = <T>(value: unknown): value is T => true;
//</editor-fold>

type OneOrTwoOrThree = 1 | 2 | 3;
type TwoOrFourOrSix = 2 | 4 | 6;

declare let t0: OneOrTwoOrThree | TwoOrFourOrSix;

const everything = [1, '', function () {}, []];

everything.filter(
  (it) => isMemberOf<OneOrTwoOrThree>(it) || isMemberOf<TwoOrFourOrSix>(it)
);

function act0(input: OneOrTwoOrThree | TwoOrFourOrSix) {
  if (input === 4) {
  }
}

declare let t1: unknown;

function act1(input: unknown): {} {
  if (input === null || input === undefined) {
    return 's';
  }

  return input;
}

console.log(act1(everything[4]));

function act2(input: unknown): {} | undefined | null {
  return input;
}

function act3(input: {} | undefined | null): unknown {
  return input;
}

declare let t2: Exclude<{} | null | undefined, {}>;

declare let t3: (1 | 2 | 3) & (2 | 4 | 6);

declare let t4: number & {};
declare let t5: number & number;
declare let t6: number & never;
declare let t7: number & unknown;
declare let t8: number & {};

type Apple = {
  sweetness: number;
};

// Exhaustive type check
const candidate = {
  sweetness: 1,
};

// Type is valid, even though it contains properties that do not exist
const a0: Apple = candidate;

type Red = {
  color: 'red'
};

// Extraction via intersection
type RedApple = Red;

type Blue = {
  color: 'blue'
};

type BlueApple = Blue;

type Infected = {
  worm: {
    name: string;
    age: number;
  }
}

const tt0: (Apple & Infected) | Apple = {
  sweetness: 0,
};

type WormyApple = Infected & Apple;

declare let a: {}; // unknown from the world of structs

const c0 = {a: 1, d: 0};

a = c0;

type AA = {} & Apple;

// Type union provides property intersections
type A = { a: number };
type B = { b: number };

// What if A and B
function handleAOrB(value: A | B): string {
  if ('a' in value && 'b' in value) {
    return 'It is a monster!';
  }

  if ('a' in value) {
    return 'It is A!';
  }

  if ('b' in value) {
    return 'It is B';
  }

  value;
}

handleAOrB({a: 1, b: 1});

function handleRedOrBlue(r: Red | Blue): string {
  if (r.color === 'red') {
    return 'red';
  }

  if (r.color === 'blue') {
    return 'blue';
  }
}

declare const s: Red & Blue;

type LocalOptionsSelect = {
  type: 'local'
  options: string[]
};

type RemoteOptionsSelect = {
  type: 'remote'
  getOptions(): Promise<string[]>
};

type SelectProps = LocalOptionsSelect | RemoteOptionsSelect;

const p: SelectProps = {
  type: 'remote',
  getOptions: async () => ['wdawd'],
};

if (p.type === 'remote') {
  p.getOptions()
}

// handleRedOrBlue({ color });

type Colored = Red | Blue;
type ProbablyWormy = {} | Infected;

type GardenApple = Apple & Colored & ProbablyWormy;

declare const apples: GardenApple[];

type RichPeopleApples = Extract<GardenApple, Red>;

type QueenApples = Blue & Apple;

type OtherApples = ExcludeExact<ExcludeExact<GardenApple, QueenApples>, RichPeopleApples>;

type ExcludeExact<TLeft, TRight> = TLeft extends TRight ? TRight extends TLeft ? never : TLeft : TLeft;

abstract class Animal {
  abstract toName(): string;
}

class Bottle {
  toName(): string {
    return '1'
  };
}

const aaa: Animal = new Bottle();

type PersonID = string & { __brand: 'PersonID' };
type DogID = string & { __brand: 'DogID' };

declare const ddd: PersonID & DogID;

export {}
