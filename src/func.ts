import assert from 'assert';

type Expression = {
  kind: string;
};

type Literal = {
  kind: 'literal';
  value: number;
};

function createLiteral(n: number): Literal {
  return { kind: 'literal', value: n };
}

function isLiteral(expression: Expression): expression is Literal {
  return expression.kind === 'literal';
}

type BinaryAdd = {
  kind: 'binary_add';
  left: Expression;
  right: Expression;
};

function createBinaryAdd(left: Expression, right: Expression): BinaryAdd {
  return { kind: 'binary_add', left, right };
}

function isBinaryAdd(expression: Expression): expression is BinaryAdd {
  return expression.kind === 'binary_add';
}

function evaluate(expression: Expression): number {
  if (isLiteral(expression)) {
    return expression.value;
  }

  if (isBinaryAdd(expression)) {
    return evaluate(expression.left) + evaluate(expression.right);
  }

  assert(false);
}

function makeTwoPlusThree() {
  return createBinaryAdd(createLiteral(2), createLiteral(3));
}

// --Danger Zone--

export {};