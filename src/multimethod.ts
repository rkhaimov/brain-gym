type Identifiable<
  TId extends string = string,
  TInnerIds extends string = string
> = {
  id: TId;
  __total_ids: TId | TInnerIds;
};

interface ExpressionsDB {
  [key: string]: Identifiable;
}

type Literal = Identifiable<'literal'> & {
  value: number;
};

interface ExpressionsDB {
  literal: Literal;
}

function createLiteral(n: number) {
  return { id: 'literal', value: n } as Literal;
}

type BinaryAdd<TChildrenIds extends string> = Identifiable<
  'binary_add',
  TChildrenIds
> & {
  left: Identifiable<TChildrenIds>;
  right: Identifiable<TChildrenIds>;
};

interface ExpressionsDB {
  binary_add: BinaryAdd<string>;
}

function createBinaryAdd<TChildrenIds extends string>(
  left: Identifiable<TChildrenIds>,
  right: Identifiable<TChildrenIds>
) {
  return { id: 'binary_add', left, right } as BinaryAdd<TChildrenIds>;
}

type IdentifierHandler<TIdentifiable extends Identifiable, TReturn> = (
  expression: TIdentifiable,
  handleNext: (next: Identifiable) => TReturn
) => TReturn;

type Handlers<TIds extends string, TReturn> = {
  [P in TIds]: IdentifierHandler<ExpressionsDB[P], TReturn>;
};

function invoke<TIds extends string, TReturn>(
  identifiable: Identifiable<string, TIds>,
  handlers: Handlers<TIds, TReturn>
): TReturn {
  const handle = handlers[identifiable.id as keyof typeof handlers];

  return handle(identifiable, (next) =>
    invoke(next as Identifiable<string, TIds>, handlers)
  );
}

const literaleval: IdentifierHandler<Literal, number> = (expression) =>
  expression.value;

const binaddeval: IdentifierHandler<BinaryAdd<string>, number> = (
  expression,
  handleNext
) => handleNext(expression.left) + handleNext(expression.right);

function makeTwoPlusThree() {
  return createBinaryAdd(
    createBinaryAdd(createLiteral(2), createLiteral(1)),
    createLiteral(2)
  );
}

invoke(makeTwoPlusThree(), {
  literal: literaleval,
  binary_add: binaddeval,
});

type SimpleCondition<TChildrenIds extends string> = Identifiable<
  'simple_condition',
  TChildrenIds
> & {
  condition: boolean;
  onTrue: Identifiable<TChildrenIds>;
  onFalse: Identifiable<TChildrenIds>;
};

interface ExpressionsDB {
  simple_condition: SimpleCondition<string>;
}

function createSimpleCondition<TChildrenIds extends string>(
  condition: boolean,
  onTrue: Identifiable<TChildrenIds>,
  onFalse: Identifiable<TChildrenIds>
) {
  return {
    id: 'simple_condition',
    condition,
    onTrue,
    onFalse,
  } as SimpleCondition<TChildrenIds>;
}

function makeTwoOrThree() {
  return createSimpleCondition(
    true,
    createLiteral(2),
    createBinaryAdd(createLiteral(1), createLiteral(2))
  );
}

const literalprint: IdentifierHandler<Literal, string> = (expression) =>
  `${expression.value}`;

const binaryaddprint: IdentifierHandler<BinaryAdd<string>, string> = (
  expression,
  handleNext
) => `${handleNext(expression.left)} + ${handleNext(expression.right)}`;

const simplcondprint: IdentifierHandler<SimpleCondition<string>, string> = (
  expression,
  handleNext
) =>
  `${expression.condition} ? ${handleNext(expression.onTrue)} : ${handleNext(
    expression.onFalse
  )}`;

const result = invoke(makeTwoOrThree(), {
  literal: literalprint,
  binary_add: binaryaddprint,
  simple_condition: simplcondprint,
});

console.log(result);
