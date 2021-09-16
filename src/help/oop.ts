interface IExpression {
  evaluate(): number;

  print(): string;
}

class Literal implements IExpression {
  constructor(private n: number) {}

  evaluate(): number {
    return this.n;
  }

  print(): string {
    return `${this.n}`;
  }
}

class BinaryAdd implements IExpression {
  constructor(private left: IExpression, private right: IExpression) {}

  evaluate(): number {
    return this.left.evaluate() + this.right.evaluate();
  }

  print(): string {
    return `${this.left.print()} + ${this.right.print()}`;
  }
}

function makeTwoPlusThree(): IExpression {
  return new BinaryAdd(new Literal(2), new Literal(3));
}

console.log(makeTwoPlusThree().evaluate());
console.log(makeTwoPlusThree().print());

export {};