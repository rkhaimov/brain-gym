// BASE module

interface Exp {
  print(): string;
}

class Lit implements Exp {
  constructor(private value: number) {}

  print(): string {
    return `${this.value}`;
  }
}

class Add implements Exp {
  constructor(
    private left: Exp,
    private right: Exp,
  ) {}

  print(): string {
    return `${this.left.print()} + ${this.right.print()}`;
  }
}

// BASE module end

// CREATION module

function createTwoPlusFive() {
  return new Add(new Lit(2), new Lit(5));
}

// CREATION module end

// OPERATION module

function operation(input: Exp) {
  console.log('The following input was supplied', input.print());
}

// OPERATION module end

// PROGRAM module

function program() {
  const created = createTwoPlusFive();

  operation(created);
}

// PROGRAM end

// EXTEND DATA STRUCT module

// With standard OO approach new data structures can be added without the need to modify BASE, CREATION and OPERATION modules
// also, it segregates similar operations on different data structures apart (SRP related)
class Neg implements Exp {
  constructor(private exp: Exp) {}

  print(): string {
    return `-1 * ${this.exp.print()}`;
  }
}

function createNegatedTwoPlusFive() {
  // New data structures can be seamlessly composed with already presented creation infrastructure
  // thus allowing creation logic to be reused (to reuse the result of its call to be precise)
  return new Neg(createTwoPlusFive());
}

function extendDataStructProgram() {
  const created = createNegatedTwoPlusFive();

  // Existing operation code also supports new operations on created ds and can be reused accordingly
  operation(created);
}

// EXTEND DATA STRUCT module end

// EXTEND OPERATION module

function evalAndPrintOperation(exp: Exp) {
  operation(exp);

  // In order for exp to be reused with operation and at the same time called with eval base Exp interface must be modified
  // it will cause all child classes to be broken (they must implement new method), thus BASE module and all its data extensions must be changed
  return exp.eval();
}

function extendOperationProgram() {
  const created = createTwoPlusFive();

  evalAndPrintOperation(created);
}

// EXTEND OPERATION module end

export {};
