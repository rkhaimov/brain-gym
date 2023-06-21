declare const user: { name: string; role: string };

type WithRole = {
  role: string;
};

const t0: WithRole = user;

t0.role;

user.name;

act(user);

function act(input: { name: string; role?: string }) {
  const str = input as { role: string; some?: boolean };

  return str.charAt(10);
}

function act4(input: Array<Card | Cash>) {
  if (input.every(isCard)) {
    input;
  }

  if (input.some(isCard)) {
    input;
  }

  input.filter(isCard).map(it => it.type);
}

type Card = {
  type: 'card';
  amount: number;
  id: number;
};

type Cash = {
  type: 'cash';
  amount: number;
  weight: number;
};

function act1(input: Card | Cash) {
  if ('id' in input) {
    input;
  }

  // type guard
  if (input.type === 'card') {
    input;
  }
}

function isCard(input: Card | Cash): input is Card {
  return true;
}

function act2(input: Card | Cash) {
  if (!isCard(input)) {
    input;
  }
}

declare function isUser(input: unknown): input is { name: string };

declare function isWithRole(input: unknown): input is { role: string };

function act3(input: unknown) {
  if (isUser(input) && isWithRole(input)) {
    input;
  }

  if (isUser(input) || isWithRole(input)) {
    input;
  }
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
