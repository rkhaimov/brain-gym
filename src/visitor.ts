interface IExpression<TVisitResult> {
  accept(visitor: IExpressionVisitor<TVisitResult>): TVisitResult;
}

class Literal<TVisitResult> implements IExpression<TVisitResult> {
  constructor(public value: number) {}

  accept(visitor: IExpressionVisitor<TVisitResult>) {
    return visitor.visitLiteral(this);
  }
}

class BinaryAdd<TVisitResult> implements IExpression<TVisitResult> {
  constructor(
    private left: IExpression<TVisitResult>,
    private right: IExpression<TVisitResult>
  ) {}

  accept(visitor: IExpressionVisitor<TVisitResult>) {
    return visitor.visitBinaryAdd(this.left.accept(visitor), this.right.accept(visitor));
  }
}


interface IExpressionVisitor<TVisitResult> {
  visitLiteral(literal: Literal<TVisitResult>): TVisitResult;

  visitBinaryAdd(left: TVisitResult, right: TVisitResult): TVisitResult;
}

class Evaluator implements IExpressionVisitor<number> {
  visitBinaryAdd(left: number, right: number): number {
    return left + right;
  }

  visitLiteral(literal: Literal<number>) {
    return literal.value;
  }
}

function makeTwoPlusThree() {
  return new BinaryAdd(new Literal(2), new Literal(3));
}

const result = makeTwoPlusThree();

console.log(result.accept(new Evaluator()));

export {};
