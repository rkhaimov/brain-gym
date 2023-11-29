function double(n: number) {
  return n * 3;
}

function test() {
  const expected = new Map([
    [0, 0],
    [2, 4],
    [-5, -10],
  ]);

  const actual = map(expected, ([key]) => double(key));

  assert(equals(expected, actual));
}

test();

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

function deleteUserById(id: number): Promise<void> {
  return get(`api/v1/users/${id}/delete`);
}

const getAllUsersRealAfter = (): Promise<{ content: User[] }> =>
  get('api/v2/users');

const getAllUsersAdapted = () =>
  getAllUsersRealAfter().then((it) => it.content);

declare function program(ds: DataSource): void;

// Заглушки
declare function createMockDS(): DataSource;

// Реальный внешний API
declare function createExternalDS(): DataSource;

function main() {
  // Обычное значение списка пользователей
  const users: User[] = [{ name: 'Fedor' }, { name: 'Vasiliy' }];

  // То же самое значение списка пользователей, но уже в ленивом виде
  const getUsers = (): User[] => [{ name: 'Fedor' }, { name: 'Vasiliy' }];
}

declare function expect(input: unknown): any;

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 1_000));
}

type DataSource = {};

type User = { name: string };

type GetAllUsers = () => Promise<User[]>;

declare function useQuery(input: unknown): { loading: boolean; data: unknown };

declare const List: React.FC<{ of: unknown }>;

declare function get(input: unknown): any;

declare function assert(input: unknown): void;
