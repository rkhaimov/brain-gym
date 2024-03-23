// BASE module

interface Exp {
  print(): string;
}

class Lit implements Exp {
  constructor(public value: number) {}

  print(): string {
    return `${this.value}`;
  }
}

class Add<T extends Exp> implements Exp {
  constructor(
    public left: T,
    public right: T,
  ) {}

  print(): string {
    return `${this.left.print()} + ${this.right.print()}`;
  }
}

// Abstract factory importance will be explained later
interface BaseExpFactory<T extends Exp> {
  createLit(value: number): T;

  createAdd(left: T, right: T): T;
}

// BASE module end

// CREATION module

function createTwoPlusFive<T extends Exp>(factory: BaseExpFactory<T>): T {
  return factory.createAdd(factory.createLit(2), factory.createLit(5));
}

// CREATION module end

// OPERATION module

function operation(input: Exp) {
  console.log('The following input was supplied', input.print());
}

// OPERATION module end

// PROGRAM module

function program() {
  const created = createTwoPlusFive<Exp>({
    createLit: (value) => new Lit(value),
    createAdd: (left, right) => new Add(left, right),
  });

  operation(created);
}

// PROGRAM end

// EXTEND DATA STRUCT module

// Adding new data structure is as easy as it was before
class Neg<T extends Exp> implements Exp {
  constructor(public exp: T) {}

  print(): string {
    return `-1 * ${this.exp.print()}`;
  }
}

// In order for this factory to be reusable independently of operations it is also must instantiate structure via abstract factory class
function createNegatedTwoPlusFive() {
  // DS compatibility is preserved
  return new Neg(
    createTwoPlusFive<Exp>({
      createLit: (value) => new Lit(value),
      createAdd: (left, right) => new Add(left, right),
    }),
  );
}

function extendDataStructProgram() {
  const created = createNegatedTwoPlusFive();

  operation(created);
}

// EXTEND DATA STRUCT module end

// EXTEND OPERATION module

// New interface must be added in order to group all operation supporting data structures
// this entity must be substitutable against standard Exp
interface EvalExp extends Exp {
  eval(): number;
}

// For each new DS eval operation is implemented in form of a new class
// usage of composition will be explained bellow
class EvalLit implements EvalExp {
  constructor(private lit: Lit) {}

  print(): string {
    return this.lit.print();
  }

  eval(): number {
    // Notice that in order for properties to be reused they must be public (at least for subclasses) thus increasing coupling
    return this.lit.value;
  }
}

// Add is slightly more complex because it is composite type
class EvalAdd implements EvalExp {
  constructor(private add: Add<EvalExp>) {}

  print(): string {
    return this.add.print();
  }

  eval(): number {
    return this.add.left.eval() + this.add.right.eval();
  }
}

// New operations accept EvalExp which denotes a group of ds supporting eval function
function evalAndPrintOperation(exp: EvalExp) {
  // This group is a subset of Exp, thus allowing itself to be reused across already implemented clients
  operation(exp);

  return exp.eval();
}

function extendOperationProgram() {
  // For existing creation code, different abstract factory is passed (that creates instances of eval exp)
  const created = createTwoPlusFive<EvalExp>({
    createLit: (value) => new EvalLit(new Lit(value)),
    createAdd: (left, right) => new EvalAdd(new Add(left, right)),
  });

  // "created" has type EvalExp thus it denotes a set of evaluable data structures
  evalAndPrintOperation(created);
}

// EXTEND OPERATION module end

// COMPOSE OPERATION AND DS EXTENSIONS module

class EvalNeg implements EvalExp {
  constructor(private neg: Neg<EvalExp>) {}

  print(): string {
    return this.neg.print();
  }

  eval(): number {
    return -1 * this.neg.exp.eval();
  }
}

function createEvalNegTwoPlusFive(): EvalExp {
  return new EvalNeg(
    new Neg(
      createTwoPlusFive<EvalExp>({
        createLit: (value) => new EvalLit(new Lit(value)),
        createAdd: (left, right) => new EvalAdd(new Add(left, right)),
      }),
    ),
  );
}

function extendDataStructAndOperationProgram() {
  const created = createEvalNegTwoPlusFive();

  evalAndPrintOperation(created);
}

// COMPOSE OPERATION AND DS EXTENSIONS module end

// COMPOSE DIFF OPERATIONS module

// Suppose we have a module implementing count operation (counts how many literal values there are)
interface CountExp extends Exp {
  count(): number;
}

class CountLit implements CountExp {
  constructor(private lit: Lit) {}

  print(): string {
    return this.lit.print();
  }

  count(): number {
    return 1;
  }
}

class CountAdd implements CountExp {
  constructor(private add: Add<CountExp>) {}

  print(): string {
    return this.add.print();
  }

  count(): number {
    return this.add.left.count() + this.add.right.count();
  }
}

// Can we implement a module that compose existing print and count operations together?

// By definition these ds must support both operations
interface EvalCountExp extends EvalExp, CountExp {}

// Supported operations are created using class composition techniques, allowing multiple different behaviours to be reused together
class EvalCountLit implements EvalCountExp {
  constructor(private lit: Lit) {}

  count(): number {
    return new CountLit(this.lit).count();
  }

  eval(): number {
    return new EvalLit(this.lit).eval();
  }

  print(): string {
    return this.lit.print();
  }
}

class EvalCountAdd implements EvalCountExp {
  constructor(private add: Add<EvalCountExp>) {}

  count(): number {
    return new CountAdd(this.add).count();
  }

  eval(): number {
    return new EvalAdd(this.add).eval();
  }

  print(): string {
    return this.add.print();
  }
}

function evalPrintAndCountOperation(exp: EvalCountExp) {
  evalAndPrintOperation(exp);

  exp.count();
}

function extendDiffOperationProgram() {
  const created = createTwoPlusFive<EvalCountExp>({
    createLit: (value) => new EvalCountLit(new Lit(value)),
    createAdd: (left, right) => new EvalCountAdd(new Add(left, right)),
  });

  evalPrintAndCountOperation(created);
}

// COMPOSE DIFF OPERATIONS module end

export {};
