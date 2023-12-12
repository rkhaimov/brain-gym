const Expression = {
  literal: (n: number) => ({ eval: () => n }),
};

function Calculator() {
  const input = useUserInput();

  return (
    <>
      <Output />
      <NumPad />
      <Equals
        onClick={() => {
          const { left, right, operation } = parse(input);

          if (operation === 'sum') {
            // Разработчик ошибся и передал left дважды
            return sum(Expression.literal(left), Expression.literal(left));
            //                            ^^^^                      ^^^^
          }

          //<editor-fold desc="Другие детали">
          console.log(right);
          //</editor-fold>
        }}
      />
    </>
  );
}

console.log(Calculator);

declare const NumPad: React.FC;
declare const Output: React.FC;

declare function parse(input: string): {
  left: number;
  right: number;
  operation: 'sum';
};

declare function useUserInput(): string;

function sum(left: Expression, right: Expression) {
  return left.eval() + right.eval();
}

function test() {
  // sum является неявной зависимостью Equals
  const rendered = <Equals />;

  //<editor-fold desc="Тесты">
  console.log(rendered);
  //</editor-fold>
}

const Equals: React.FC = () => {
  //<editor-fold desc="Инициализация">
  const a = 0;
  const b = 0;
  //</editor-fold>

  // Где-то в глубине реализации
  const result = sum(a, b);

  //<editor-fold desc="Вывод">
  return null;
  //</editor-fold>
}

console.log(test());

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 1_000));
}

type User = { name: string; id: number };

type GetAllUsers = () => Promise<User[]>;

declare function useQuery(input: unknown): { loading: boolean; data: unknown };

declare const List: React.FC<{ of: unknown }>;

declare function get(input: unknown): any;

function assert(input: boolean) {
  if (input) {
    return true;
  }

  throw new Error('Failed');
}

export {};
