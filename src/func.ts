import assert from 'assert';

type Expression = {
  kind: string;
};

// --- Literal ---
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

// --- Literal ---

// --- BinaryAdd ---
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

// --- BinaryAdd ---

interface Handler<TReturn, TExpression> {
  handles(expression: TExpression): boolean;

  handle(
    expression: TExpression,
    visit: (expression: Expression) => TReturn
  ): TReturn;
}

function apply<TReturn>(
  expression: Expression,
  handlers: Array<Handler<TReturn, Expression>>
): TReturn {
  const handler = handlers.find((handler) => handler.handles(expression));

  assert(handler !== undefined);

  return handler.handle(expression, (next) => apply(next, handlers));
}

type EvaluateHandler<TExpression> = Handler<number, TExpression>;

const evaluateLiteral: EvaluateHandler<Literal> = {
  handles: isLiteral,
  handle: (expression) => expression.value,
};

const evaluateBinaryAdd: EvaluateHandler<BinaryAdd> = {
  handles: isBinaryAdd,
  handle: (expression, visit) =>
    visit(expression.left) + visit(expression.right),
};

function makeOnePlusTwo() {
  return createBinaryAdd(createLiteral(1), createLiteral(2));
}

type PrintHandler<TExpression> = Handler<string, TExpression>;

const printLiteral: PrintHandler<Literal> = {
  handles: isLiteral,
  handle: (expression) => `${expression.value}`,
};

const printBinaryAdd: PrintHandler<BinaryAdd> = {
  handles: isBinaryAdd,
  handle: (expression, visit) =>
    `${visit(expression.left)} + ${visit(expression.right)}`,
};

console.log(apply(makeOnePlusTwo(), [evaluateLiteral, evaluateBinaryAdd]));
console.log(apply(makeOnePlusTwo(), [printLiteral, printBinaryAdd]));

// --- BinaryMultiplier ---
type BinaryMultiplier = {
  kind: 'binary_multiplier';
  left: Expression;
  right: Expression;
};

function createBinaryMultiplier(
  left: Expression,
  right: Expression
): BinaryMultiplier {
  return { kind: 'binary_multiplier', left, right };
}

function isBinaryMultiplier(
  expression: Expression
): expression is BinaryMultiplier {
  return expression.kind === 'binary_multiplier';
}

// --- BinaryMultiplier ---

function makeTwoTimesFive() {
  return createBinaryMultiplier(createLiteral(2), createLiteral(5));
}

const evaluateBinaryMultiplier: EvaluateHandler<BinaryMultiplier> = {
  handles: isBinaryMultiplier,
  handle: (expression, visit) =>
    visit(expression.left) * visit(expression.right),
};

console.log(
  apply(makeTwoTimesFive(), [
    evaluateLiteral,
    evaluateBinaryAdd,
    evaluateBinaryMultiplier,
  ])
);
