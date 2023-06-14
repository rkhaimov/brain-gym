const n0 = true;

const user = {
  username: 'Vasiliy',
  age: 13,
} as const;

type User = {
  name: string;
  surname: string;
};

type Admin = {
  level: number;
  surname: number;
};

declare const t: User & Admin;

function join(left: User, right: Admin): User & Admin {
  return { ...left, ...right };
}

function createCash() {
  return { type: 'cash' as const, weight: 100 };
}

function createCard() {
  return { type: 'card' as const, number: 101 };
}

function createCashOrCard(flag: boolean) {
  if (flag) {
    return createCash();
  }

  return createCard();
}

type CreateCard = typeof createCash;
type Cash = ReturnType<CreateCard>;

const result = createCashOrCard(true);

if (result.type === 'cash') {
  result.weight;
}

enum Colors {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

declare const n: typeof Colors;

console.log(Colors);

function act0(input: Colors): 'red' | 'green' | 'blue' {
  return input;
}

console.log(Object.keys(Colors).map((it) => Colors[it as keyof typeof Colors]));

act0(Colors.Blue);

type User0 = {
  name: string;
  age: number;
};

declare const namez: User0[keyof User0];

type A = keyof typeof Colors;

declare const property: keyof (
  | { name: string; age: string }
  | { value: string; age: number }
);

class UserQ {}

function joina(left: number, right: string) {}

type AB = Parameters<typeof joina>;

type Pair = [number, string];

declare const tt: Pair;

declare const q: keyof Pair;

const left = [1, 2] as const;
const right = [3, 4, 5] as const;

declare function act12(): ['wallet', number, string] | ['cash', boolean];

const rr = act12();

if (rr['0'] === 'wallet') {
  rr;
}

export {}
