const divide = (n: number, factor: number): number => {
  if (factor === 0) {
    throw new Error('Can not divide by zero');
  }

  return n / factor;
};

const head = <T>(ns: T[]): T => {
  if (ns.length === 0) {
    throw new Error('List is empty');
  }

  return ns[0];
};

const parse = (n: string): number => {
  if (isNaN(parseInt(n, 10))) {
    throw new Error('Not valid integer');
  }

  return parseInt(n, 10);
};

const input0 = ['10', '2', '1'];
const input1 = '12';

const firstN = head(input0);
const secondN = parse(input1);

const parsedN = parse(firstN);

const result = divide(secondN, parsedN);
