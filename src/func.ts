type Expression = {};

type Literal = Expression & {
  value: number;
};

function createLiteral(n: number): Literal {
  return { value: n };
}

type BinaryAdd = Expression & {
  left: Expression;
  right: Expression;
};

function createBinaryAdd(left: Expression, right: Expression): BinaryAdd {
  return { left, right };
}

function evaluate(expression: Expression | BinaryAdd | Literal): number {
  if ('value' in expression) {
    return expression.value;
  }

  if ('left' in expression) {
    return evaluate(expression.left) + evaluate(expression.right);
  }

  return 0;
}

function makeOnePlusTwo() {
  return createBinaryAdd(createLiteral(1), createLiteral(2));
}

console.log(evaluate(makeOnePlusTwo()));
