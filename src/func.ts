import assert from 'assert';

type Expression = {};

// --- Literal ---
type Literal = Expression & {
  value: number;
};

function createLiteral(n: number): Literal {
  return { value: n };
}

function isLiteral(expression: Expression): expression is Literal {
  return 'value' in expression;
}

// --- Literal ---

// --- BinaryAdd ---
type BinaryAdd = Expression & {
  left: Expression;
  right: Expression;
};

function createBinaryAdd(left: Expression, right: Expression): BinaryAdd {
  return { left, right };
}

function isBinaryAdd(expression: Expression): expression is BinaryAdd {
  return 'left' in expression;
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

console.log(apply(makeOnePlusTwo(), [evaluateLiteral, evaluateBinaryAdd]));
