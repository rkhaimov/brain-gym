interface IntAlg<TReturn> {
  literal(n: number): TReturn;

  add(left: TReturn, right: TReturn): TReturn;
}

function makeThreePlusFive<TReturn>(factory: IntAlg<TReturn>): TReturn {
  return factory.add(factory.literal(3), factory.literal(5));
}

class NumberFactory implements IntAlg<number> {
  add(left: number, right: number): number {
    return left + right;
  }

  literal(n: number): number {
    return n;
  }
}

console.log(makeThreePlusFive(new NumberFactory()));

class PrintFactory implements IntAlg<string> {
  add(left: string, right: string): string {
    return `${left} + ${right}`;
  }

  literal(n: number): string {
    return `${n}`;
  }
}

console.log(makeThreePlusFive(new PrintFactory()));
