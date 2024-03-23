// BASE module

interface Exp {
  accept<T>(visitor: Visitor<T>): T;
}

interface Visitor<T> {
  onLit(lit: Lit): T;

  onAdd(add: Add): T;
}

class Lit implements Exp {
  constructor(public value: number) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.onLit(this);
  }
}

class Add implements Exp {
  constructor(
    public left: Exp,
    public right: Exp,
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.onAdd(this);
  }
}

class PrintVisitor implements Visitor<string> {
  onAdd(add: Add): string {
    return `${add.left.accept(this)} + ${add.right.accept(this)}`;
  }

  onLit(lit: Lit): string {
    return `${lit.value}`;
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
  console.log(
    'The following input was supplied',
    input.accept(new PrintVisitor()),
  );
}

// OPERATION module end

// PROGRAM module

function program() {
  const created = createTwoPlusFive();

  operation(created);
}

// PROGRAM end

// EXTEND OPERATION module

// Visitor pattern allows to create new operations without the need to modify BASE, CREATION and OPERATION modules
// also, it groups similar operations on different data structures together (SRP related)
class EvalVisitor implements Visitor<number> {
  onAdd(add: Add): number {
    return add.left.accept(this) + add.right.accept(this);
  }

  onLit(lit: Lit): number {
    return lit.value;
  }
}

// New operations can be composed with old ones easily
function evanAndPrintOperation(exp: Exp) {
  operation(exp);

  return exp.accept(new EvalVisitor());
}

function extendOperationProgram() {
  // Existing creation code (witch instantiates old data structures) also can be reused with new operations
  const created = createTwoPlusFive();

  evanAndPrintOperation(created);
}

// EXTEND OPERATION module end

// EXTEND DATA STRUCT module

class Neg implements Exp {
  constructor(public exp: Exp) {}

  accept<T>(visitor: Visitor<T>): T {
    // In order new data structure to be added (that is composable with existing creation code and also reusable with already implemented operations)
    // Visitor must be modified
    // it will cause all child visitors to be broken (they must implement new method), thus BASE module and all its operations extensions must be changed
    return visitor.onNeg();
  }
}

function createNegatedTwoPlusFive() {
  return new Neg(createTwoPlusFive());
}

function extendDataStructProgram() {
  const created = createNegatedTwoPlusFive();

  operation(created);
}

// It is worth mentioning that standard functional approach (involving pattern matching on ds cases) has exactly the same flaws as presented solution here

// EXTEND DATA STRUCT module end

export {};
