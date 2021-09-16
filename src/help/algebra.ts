interface IExpFactory<TReturn> {
  literal(n: number): TReturn;

  add(left: TReturn, right: TReturn): TReturn;
}

function makeThreePlusFive<TReturn>(factory: IExpFactory<TReturn>): TReturn {
  return factory.add(factory.literal(3), factory.literal(5));
}

class NumberFactory implements IExpFactory<number> {
  add(left: number, right: number): number {
    return left + right;
  }

  literal(n: number): number {
    return n;
  }
}

console.log(makeThreePlusFive(new NumberFactory()));

class PrintFactory implements IExpFactory<string> {
  add(left: string, right: string): string {
    return `${left} + ${right}`;
  }

  literal(n: number): string {
    return `${n}`;
  }
}

console.log(makeThreePlusFive(new PrintFactory()));

interface IExpWithMultiFactory<TReturn> extends IExpFactory<TReturn> {
  multiply(left: TReturn, right: TReturn): TReturn;
}

function makeTwoTimesTwo<TReturn>(
  factory: IExpWithMultiFactory<TReturn>
): TReturn {
  return factory.multiply(factory.literal(2), factory.literal(2));
}

class MultiPrintFactory
  extends PrintFactory
  implements IExpWithMultiFactory<string>
{
  multiply(left: string, right: string): string {
    return `${left} * ${right}`;
  }
}

console.log(makeTwoTimesTwo(new MultiPrintFactory()));
