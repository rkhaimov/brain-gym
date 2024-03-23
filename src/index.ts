type Expression = {
  kind: string;
};

type Literal = {
  kind: 'literal';
  value: number;
};

function isLiteral(expression: Expression): expression is Literal {
  return expression.kind === 'literal';
}

type Add<T extends Expression> = {
  kind: 'add';
  left: T;
  right: T;
};

function isAdd(expression: Expression): expression is Add<Expression> {
  return expression.kind === 'add';
}

type HandlerOn<TStruct extends Expression, R> = {
  handle(value: Expression, orElse: (value: Expression) => R): R;
};

/// -----

const literalEvalVisitor: HandlerOn<Literal, number> = {
  handle: (expression, orElse) => {
    if (isLiteral(expression)) {
      return expression.value;
    }

    return orElse(expression);
  },
};

const createAddEvalVisitor = <T extends Expression = never>(): HandlerOn<
  Add<T>,
  string
> => ({
  handle: (value, orElse) => {},
});

const r = Promise.all([createAddEvalVisitor(), literalEvalVisitor]).then(
  (q) => {},
);

declare function createOperationHandlers<
  THandlers extends HandlerOn<Expression, unknown>[] | [],
>(
  handlers: THandlers,
): Intersect<
  {
    [I in keyof THandlers]: THandlers[I] extends HandlerOn<
      Expression,
      infer RResult
    >
      ? (input: RResult) => void
      : never;
  }[number]
>;

type Intersect<A extends (arg: R) => any, R = never> = R;

function program(a: Literal | Add<Literal>): number {}

const t = createOperationHandlers([createAddEvalVisitor(), literalEvalVisitor]);
