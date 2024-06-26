import fs from 'fs';
import assert from 'node:assert';
import readline from 'readline';

function UsersPage() {
  const users = await interceptRejectionsOf(getUsers);

  //<editor-fold desc="Отрисовка страницы">
  users;

  return '1';
  //</editor-fold>
}

async function AdminCreatePage() {
  const onSubmit = (form: Admin) =>
    interceptRejectionsOf(() => getAdmins(form));

  //<editor-fold desc="Отрисовка страницы">
  onSubmit;
  //</editor-fold>
}

declare function getUsers(): Promise<unknown>;

async function showAtLeastOneAdmin() {
  const admins = await getAdmins();

  const admin: Admin = admins.head;

  console.log('There always will be at least one admin', admin.name);
}

interface ImmutableMap<T> {
  has(key: string): boolean;

  get(key: string): T | undefined;
}

function client(map: ImmutableMap<Admin>) {
  const key = 'Vasiliy';

  if (map.has(key)) {
    const user = map.get(key) as Admin;
  }
}

type NonEmptyArray<T> = {
  head: T;
  tail: T[];
};

declare function getAdmins(): Promise<NonEmptyArray<Admin>>;

type Admin = { name: string };

console.log(showAtLeastOneAdmin);

async function interceptRejectionsOf<T>(
  runAsync: () => Promise<T>,
): Promise<T> {
  try {
    return runAsync();
  } catch (e) {
    console.log(
      'Exception has been caught. Contact administrator for more info',
      e,
    );

    throw e;
  }
}

declare function parseAndAddProduct(
  line: string,
  onProductValidated: (product: Product | undefined) => void,
  delimiter = ',',
): void;

declare function getProductsByDate(arg: unknown): Promise<string>;

async function getProductsFromAPI(source: APISource) {
  const products: Product[] = [];
  const content = await getProductsByDate(source.date);

  for (const line of content.split('\n')) {
    const [name, price] = line.split(',');

    if (name === undefined) {
      logger.error('Name is invalid');

      return;
    }

    if (price === undefined) {
      logger.error('Price is invalid');

      return;
    }

    products.push({ name, price: parseInt(price) });
  }

  return products;
}

async function getProductsFromFile(source: FileSource) {
  const products: Product[] = [];
  const stream = fs.createReadStream(source.file);
  const rl = readline.createInterface({ input: stream });


  return products;
}

interface APILogger {
  log(key: number, ...message: string[]): void;

  error(key: number, ...message: string[]): void;
}

function apiLoggerToLogger(apiLogger: APILogger): Logger {
  const key = obtainAuthKey();

  return {
    log: (...messages) => apiLogger.log(key, ...messages),
    error: (...messages) => apiLogger.error(key, ...messages),
  };
}

console.log(apiLoggerToLogger);

declare function obtainAuthKey(): number;

interface Logger {
  log(...message: unknown[]): void;

  error(...message: unknown[]): void;
}

function compatCheck(apiLogger: APILogger): Logger {
  return apiLogger;
}

console.log(compatCheck);

declare const logger: Logger;
declare const r: APILogger;

function ensureProductIsValid({
  name,
  price,
}: ParsedProduct): Product | undefined {
  if (name === undefined) {
    logger.error('Name is invalid');

    return;
  }

  if (price === undefined || parseInt(price) < 0) {
    logger.error('Age is invalid');

    return;
  }

  return { name, price: parseInt(price) };
}

type Source = FileSource | APISource;
type FileSource = { type: 'file'; file: string };
type APISource = { type: 'api'; date: string };

async function getProducts(source: FileSource | APISource) {
  return await (source.type === 'api'
    ? getProductsFromAPI(source)
    : getProductsFromFile(source));
}

function showCountOfInvalidProducts(products: Product[]) {
  const invalidProducts = products.filter((it) => it.type === 'invalid');

  console.log(invalidProducts.length);
}


type ParsedProduct = Record<string, string | undefined>;

console.log(showCountOfInvalidProducts, calcShowTotal);

function calcShowTotal(products: Product[]): Log<void> {
  const sum = products.reduce((result, it) => it.price + result, 0);

  return [`Total sum of all products is ${sum}`, undefined];
}

function handleLog(logs: Log<unknown>[]) {
  const logger = createAPILogger();
  const key = obtainAuthKey();

  logs.forEach((effect) => logger.log(key, effect[0]));
}

console.log(handleLog);

type Log<T> = [message: string, payload: T];

function saveTotalToState(products: Product[]) {
  state['total'] = products.reduce((result, it) => it.price + result, 0);
}

function updateScreen() {
  render(state);
}

console.log(saveTotalToState, updateScreen);

declare function render(s: typeof state): unknown;

declare const state: Record<string, unknown>;

function test() {
  const html = UsersPage();

  assert(
    html ===
      `
    <ul>
      <li>User 0</li>
      <li>User 1</li>
    </ul>
  `,
  );
}

declare function toMatchSnapshot(input: unknown): void;

console.log(test);

async function main(file: string) {
  const stream = fs.createReadStream(file);
  const rl = readline.createInterface({ input: stream });

  const products: Product[] = [];

  for await (const line of rl) {
    const [name, price] = line.split(',');

    if (name === undefined) {
      console.error('Name is invalid');

      return;
    }

    if (price === undefined) {
      console.error('Price is invalid');

      return;
    }

    products.push({ name, price: parseInt(price) });
  }

  const sum = products.reduce((result, it) => it.price + result, 0);

  console.log('Total sum of all products is', sum);
}

type Product = {
  name: string;
  price: number;
};

console.log(main);

declare function createAPILogger(): APILogger;

declare function pureProgram(source: Source): Log<unknown>[];

declare const loggable: <T>(target: Object, propertyKey: unknown) => never;

declare const memo: <T>(target: Object, propertyKey: unknown) => never;

class Suggestions {
  @loggable
  @memo
  suggestProductPriceByKind(
    kind: Product['kind'],
    similar: Product[],
  ): Product['price'] | undefined {
    const product = similar.findIndex((it) => it.kind === kind);

    if (product === -1) {
      return;
    }

    return selectFirstLargeEnough(similar.slice(product));
  }
}

console.log(new Suggestions().suggestProductPriceByKind);

function selectFirstLargeEnough(
  similar: Product[],
): Product['price'] | undefined {
  return similar.find((it) => it.price >= 10)?.price;
}

console.log(suggestProductPriceByKindMemo);

declare function bisect<T>(list: T[]): [T[], T[]];

console.log(suggestProductPriceByKind);

function isSystemOK() {
  return Promise.all([
    fetch('/api/v1/ms-0/system/state'),
    fetch('/api/v1/ms-1/system/state'),
    fetch('/api/v1/ms-2/system/state'),
    fetch('/api/v1/ms-3/system/state'),
  ]).then((states) => states.every((it) => it));
}

function LoginPage() {
  return Form(
    AsyncBuilder({
      query: isSystemOK,
      build: (ok: boolean) =>
        ok
          ? Text({
              content: 'Система работает в штатном режиме',
              style: { color: 'green' },
            })
          : Text({
              content:
                'Система сейчас не в лучшем состоянии, могут наблюдаться проблемы с работой приложения',
              style: { color: 'red' },
            }),
    }),
    TextInput({ placeholder: 'Логин' }),
    PasswordInput({ placeholder: 'Пароль' }),
    Button({
      text: 'Войти',
      onClick: login,
    }),
  );
}

type LoginForm = {
  login: string;
  password: string;
};

type Validate = (
  form: LoginForm,
) => Either<AuthorizationPayload, ErrorsHaving<LoginForm>>;

type AuthorizationPayload = {
  login: NonEmptyString;
  password: NonEmptyString;
};

type Authorize = (
  payload: AuthorizationPayload,
) => Promise<Either<User, AuthorizationError>>;

enum AuthorizationError {
  UserDoesNotExist,
  UserIsBlocked,
}

type User = {};

function a(a: Validate, b: Authorize) {
  AuthorizationError.UserDoesNotExist;
  AuthorizationError.UserIsBlocked;
}

type NonEmptyString = string;

type Either<A, B> = string;

type ErrorsHaving<T> = T;

declare function login(): unknown;

console.log(LoginPage);

type Component = (...props: unknown) => {};

declare const Button: Component;
declare const AsyncBuilder: Component;
declare const TextInput: Component;
declare const Text: Component;
declare const PasswordInput: Component;
declare const Form: Component;
