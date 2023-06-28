class User {
  constructor(public name: string, public age: number) {}

  say(this: User) {
    this;
  }
}

console.log(User);

console.log();

function act(user: typeof User) {
  new user('awd', 12);
}

declare const n: ConstructorParameters<typeof User>;

n.sort();

n[0];
n[1];
n[2];

const t: 2 = n.length;

type Pair = [number, string];

type Another = [boolean, ...Pair];

declare const tt: Pair;

declare const q: keyof Pair;

if (q === '2') {
  tt['0'];
}

declare const n0: [number, string, number] & [number, string, { b: number }];

n0[3];

const left = [1, 2] as const;
const right = [3, 4, 5] as const;

declare function act12(): ['wallet', number, string] | ['cash', boolean];

const rr = act12();

function act13(left: [number, string], right: [boolean]) {
  const [t, q] = left;

  return [left.slice(1), ...right] as const;
}

declare const t1: ReturnType<typeof act13>;

t1.length;

if (rr.length === 2) {
  rr;
}

if (rr['0'] === 'wallet') {
  rr;
}
