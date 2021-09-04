import assert from 'assert';

interface IExpression<TVisitorResult = unknown> {
  accept(visitor: IExpressionVisitor<unknown>): unknown;
}

class Literal implements IExpression {
  constructor(public n: number) {}

  accept(visitor: IExpressionVisitor<unknown>): unknown {
    return visitor.visitLiteral(this);
  }
}

class BinaryAdd implements IExpression {
  constructor(public left: IExpression, public right: IExpression) {}

  accept(visitor: IExpressionVisitor<unknown>): unknown {
    return visitor.visitBinaryAdd(this);
  }
}

interface IExpressionVisitor<TVisitResult> {
  visitLiteral(literal: Literal): TVisitResult;

  visitBinaryAdd(binaryAdd: BinaryAdd): TVisitResult;
}

class Evaluator implements IExpressionVisitor<number> {
  visitBinaryAdd(binaryAdd: BinaryAdd): number {
    const leftResult = binaryAdd.left.accept(this);
    const rightResult = binaryAdd.right.accept(this);

    assert(typeof leftResult === 'number');
    assert(typeof rightResult === 'number');

    return leftResult + rightResult;
  }

  visitLiteral(literal: Literal): number {
    return literal.n;
  }
}

function makeTwoPlusThree() {
  return new BinaryAdd(new Literal(2), new Literal(3));
}

const result = makeTwoPlusThree();

console.log(result.accept(new Evaluator()) as number);

export {};
