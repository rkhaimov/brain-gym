interface IExpression<TVisitResult> {
  accept(visitor: IExpressionVisitor<TVisitResult>): TVisitResult;
}

class Literal<TVisitResult> implements IExpression<TVisitResult> {
  constructor(private n: number) {}

  getValue() {
    return this.n;
  }

  accept(visitor: IExpressionVisitor<TVisitResult>) {
    return visitor.visitLiteral(this);
  }
}

class BinaryAdd<TVisitResult> implements IExpression<TVisitResult> {
  constructor(
    public left: IExpression<TVisitResult>,
    public right: IExpression<TVisitResult>
  ) {}

  accept<TVisitResult>(visitor: IExpressionVisitor<TVisitResult>) {
    return visitor.visitBinaryAdd(this);
  }
}

interface IExpressionVisitor<TVisitResult> {
  visitLiteral(literal: Literal<TVisitResult>): TVisitResult;

  visitBinaryAdd(binaryAdd: BinaryAdd<TVisitResult>): TVisitResult;
}

class Evaluator implements IExpressionVisitor<number> {
  visitBinaryAdd(binaryAdd: BinaryAdd<number>): number {
    return binaryAdd.left.accept(this) + binaryAdd.right.accept(this);
  }

  visitLiteral(literal: Literal<number>) {
    return literal.getValue();
  }
}

function makeTwoPlusThree() {
  return new BinaryAdd(new Literal(2), new Literal(3));
}

const result = makeTwoPlusThree();

console.log(result.accept(new Evaluator()));

export {};
