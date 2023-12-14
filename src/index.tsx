type Screen = unknown;

// Интерфейс (глаза) пользователя
interface IUserInterface {
  writeToMonitor(input: Screen): void;
}

declare function createUser(): { input: IUserInterface };

// Основная программа
function program(output: IUserInterface) {
  const screen = console.log(1); //<editor-fold desc="Реализация программы">
  //</editor-fold>

  output.writeToMonitor(screen);
}

function main() {
  // Реальный пользователь (клиент)
  const user = createUser();

  // Программа (сервер) выводит информацию пользователю,
  // содержание выводимого и есть поведение
  program(user.input);
}

console.log(main);

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
  assert(doubleWhenEven(5) === 5);
}

function doubleWhenEven(n: number): number {
  if (n % 2 === 0) {
    return n * 2;
  }

  // Строчка выполняется и будет засчитана как покрытая,
  // хотя фактически тесты её игнорируют
  doSomething();

  return n;
}

function doSomething() {};

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
};

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
