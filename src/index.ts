const head = <T>(ns: T[]): T => {
  if (ns.length === 0) {
    throw new Error('List is empty');
  }

  return ns[0];
};

const parse = (n: string): number => {
  if (isNaN(parseInt(n, 10))) {
    throw new Error('Not a number');
  }

  return parseInt(n, 10);
};

const divide = (n: number, factor: number): number => {
  if (factor === 0) {
    throw new Error('Can not divide by zero');
  }

  return n / factor;
};

const magic = (i0: string[], i1: string): number => {
  const first = head(i0);
  const n0 = parse(first);
  const n1 = parse(i1);

  return divide(n0, n1);
};

const input0 = ['10', '2', '1'];
const input1 = '12';

console.log(magic(input0, input1));
