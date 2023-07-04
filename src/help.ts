const identity0 = (input: unknown): unknown => input;

const identity1 = <T>(input: T) => input;

identity1(1);

const identityOnNumber = identity1<number>;

const identity2 = <T>(input: T, un: unknown) => {
  input = un;

  return input;
};

const identity3 = <A, B>(left: A, right: B, l: keyof A) => {
  right = left;
};

const createBox = <T>(initial: T) => {
  let current = initial;

  return {
    get: () => current,
    set: (next: T) => (current = next),
  };
};

const nBox = createBox(10);

const shoutSquaredAndReturn = <T extends number>(input: T) => {
  input;

  console.log('Received ', Math.pow(input, 2));

  return input;
};

const aa = <A, B extends A>(left: A, right: B) => {
  return right;
};

type AA = typeof aa;

function b(input: AA) {
  input(10, 20);
}

function t0<T>(obj: T, prop: keyof T) {
  return obj[prop];
}

const t = t0({ name: 'Vasiliy', age: 12 }, 'age');

function t1<T, K extends keyof T>(obj: T, prop: K) {
  return obj[prop];
}

const tt = t1({ name: 'Vasiliy', age: 12 }, 'age');
