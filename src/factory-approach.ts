// BASE module

// Notice that explicit structures are missing. They described indirectly via factory arguments
interface BaseExpressionFactory<T> {
  createLit(value: number): T;

  createAdd(left: T, right: T): T;
}

// Operations are described as simple factory method implementations
const basePrintOperation: BaseExpressionFactory<string> = {
  createAdd: (left, right) => `${left} + ${right}`,
  createLit: (value) => `${value}`,
};

// BASE module end

// CREATION module

function createTwoPlusFive<T>(factory: BaseExpressionFactory<T>): T {
  return factory.createAdd(factory.createLit(2), factory.createLit(5));
}

// CREATION module end

// PROGRAM module

function program() {
  // Notice how act of creation is merged with act of operation
  // this is due to explicit data structures are missing
  const created = createTwoPlusFive(basePrintOperation);
}

// PROGRAM end

// EXTEND DATA STRUCT module

interface NegExpressionFactory<T> extends BaseExpressionFactory<T> {
  createNeg(on: T): T;
}

function createNegatedTwoPlusFive<T>(factory: NegExpressionFactory<T>): T {
  return factory.createNeg(createTwoPlusFive(factory));
}

const negPrintOperation: NegExpressionFactory<string> = {
  ...basePrintOperation,
  createNeg: (on) => `-1 * ${on}`,
};

function extendDataStructProgram() {
  const created = createNegatedTwoPlusFive(negPrintOperation);
}

// EXTEND DATA STRUCT module end

// EXTEND OPERATION module

// Defining new operation is as simple as adding new concrete abstract factory implementation
const baseEvalOperation: BaseExpressionFactory<number> = {
  createLit: (value) => value,
  createAdd: (left, right) => left + right,
};

function extendOperationProgram() {
  const created = createTwoPlusFive(baseEvalOperation);
}

// EXTEND OPERATION module end

// COMPOSE OPERATION AND DS EXTENSIONS module

// New data structures are described via newly added factory methods (NegExpressionFactory in this case)
const negEvalOperation: NegExpressionFactory<number> = {
  ...baseEvalOperation,
  createNeg: (on) => -1 * on,
};

function extendDataStructAndOperationProgram() {
  // Already existing creation functions can be reused easily
  const created = createNegatedTwoPlusFive(negEvalOperation);
}

// COMPOSE OPERATION AND DS EXTENSIONS module end

// COMPOSE DIFF OPERATIONS module

const baseCountOperation: BaseExpressionFactory<number> = {
  createLit: () => 1,
  createAdd: (left, right) => left + right,
};

function extendDiffOperationProgram() {
  // print
  createTwoPlusFive(basePrintOperation);

  // eval
  createTwoPlusFive(baseEvalOperation);

  // count
  createTwoPlusFive(baseCountOperation);
}

// COMPOSE DIFF OPERATIONS module end
