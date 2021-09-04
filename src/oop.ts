interface IExpression {
  evaluate(): number;
}

class Literal implements IExpression {
  constructor(private n: number) {}

  evaluate(): number {
    return this.n;
  }
}

class BinaryAdd implements IExpression {
  constructor(private left: IExpression, private right: IExpression) {}

  evaluate(): number {
    return this.left.evaluate() + this.right.evaluate();
  }
}

function makeTwoPlusThree(): IExpression {
  return new BinaryAdd(new Literal(2), new Literal(3));
}

console.log(makeTwoPlusThree().evaluate());
