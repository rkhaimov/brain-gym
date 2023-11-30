function double(n: number) {
  return n * 3;
}

/**
 * Представляет собой процесс тестирования любой чистой функции
 * @param expected Ожидаемое поведение функции ввиде таблицы ввода/вывода
 * @param program Тестируемое поведение
 */
function test<K, V>(expected: Map<K, V>, program: (input: K) => V) {
  const actual = map(expected, ([key]) => program(key));

  assert(equals(expected, actual));
}

function equals(
  left: Map<unknown, unknown>,
  right: Map<unknown, unknown>
): boolean {
  return (
    JSON.stringify(Array.from(left.values())) ===
    JSON.stringify(Array.from(right.values()))
  );
}

function map<K, A, B>(
  table: Map<K, A>,
  transform: (kv: [K, A]) => B
): Map<K, B> {
  return new Map(
    Array.from(table.entries()).map(([key, value]) => [
      key,
      transform([key, value]),
    ])
  );
}

function getAllUsers(): Promise<User[]> {
  return get('api/v1/users');
}

// Команда выполняющая сайд-эффект
function deleteUserById(id: number): Promise<void> {
  return get(`api/v1/users/${id}/delete`);
}

// Команда не выполняющая сайд-эффект (уже по сути командой не является)
function deleteUserByIdMock(id: number): Promise<void> {
  return ['deleteUserById', [id]];
}

const getAllUsersRealAfter = (): Promise<{ content: User[] }> =>
  get('api/v2/users');

const getAllUsersAdapted = () =>
  getAllUsersRealAfter().then((it) => it.content);

// Реальный внешний API
declare function createExternalDS(): DataSource;

// Заглушки
const createMockDS = (): DataSource => ({
  getUsers: async () => [],
});

function main() {
  // Таблица ввода/вывода. Пока рассматриваются только входные данные
  // интерфейс источников данных DataSource
  const expected = new Map<DataSource, unknown>([
    [
      // Реализация конкретных queries переопределяется следующим образом
      {
        ...createMockDS(),
        getUsers: async () => [{ name: 'Fedor' }, { name: 'Vasiliy' }],
      },
      //<editor-fold desc="Скрыто">
      0,
      //</editor-fold>
    ],
  ]);

  test(expected, program);
}

function program(source: DataSource): CommandResult {
  //<editor-fold desc="Много кода">
  const a = 0;
  //</editor-fold>

  // Где-то в глубине какого-то обработчика событий
  source.deleteUserById(10);
}

type CommandResult = unknown;

declare function expect(input: unknown): any;

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 1_000));
}

type DataSource = {
  getUsers(): Promise<User[]>;
  deleteUserById(id: User['id']): Promise<void>;
};

type User = { name: string; id: number };

type GetAllUsers = () => Promise<User[]>;

declare function useQuery(input: unknown): { loading: boolean; data: unknown };

declare const List: React.FC<{ of: unknown }>;

declare function get(input: unknown): any;

declare function assert(input: unknown): void;
