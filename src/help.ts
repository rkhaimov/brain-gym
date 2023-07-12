class Shape {
  getDescription(preface: string) {
    assert(preface.length <= 5);

    const result = {
      name: 'I am shape',
      description: `${preface}: it is all about shapes`,
    };

    assert(result.name.length <= 20);

    return result;
  }
}

class Rectangle extends Shape {
  getDescription(preface: string) {
    assert(preface.length <= 10);

    return {
      name: 'I am rectangle',
      type: 'rectangle',
      description: 'No description',
    }; // narrower to wider or covariant
  }
}

// Covariant
const r: Shape = new Rectangle();

const shoutShapeName = (input: Shape) => {
  const meta = input.getDescription('Intro');

  assert(meta.name.length <= 20);

  console.log(meta.name);
  console.log(meta.description);
};

shoutShapeName(new Rectangle());

function assert(condition: boolean) {
  if (!condition) {
    throw new Error('Fails');
  }
}

function sum(left: number, right: number): number {
  assert(left >= 0);

  const result = left + right;

  assert(result - left === right);
  assert(result - right === left);

  return result;
}

const t: number = -1;

console.log(sum(t, t));

// SelectProps Contravariant on T
type SelectProps0<in T> = {
  onChange(option: T): void;
};

function act0(
  input: SelectProps0<{ name: string }>
): SelectProps0<{ name: string; surname: string }> {
  return input;
}

const result0 = act0({
  onChange(option) {
    option.name;
  },
});

// SelectProps Covariant on T
type SelectProps1<out T> = {
  get(index: number): T;
  length: number;
};

function act1(input: SelectProps1<{ name: string }>): SelectProps1<{}> {
  return input;
}

const result1 = act1({
  get: (index: number) => ({ name: 'Vasiliy' }),
  length: 1,
});

result1.get(0);

// SelectProps is invariant on T
type SelectProps<in out T> = {
  get(index: number): T;
  length: number;
  onChange(option: T): void;
};

function act2(
  input: SelectProps<{ name: string }>
): SelectProps<{ name: string }> {
  return input;
}

// Array covariant on T
function act3(input: Array<{ name: string }>): Array<{}> {
  return input;
}

const names = [{ name: 'Vasiliy' }];

const result2 = act3(names);

result2.push(false);

console.log(names);

export {};
