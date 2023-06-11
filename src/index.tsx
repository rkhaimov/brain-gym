declare function program(events: Events, queries: Queries): [Images, Commands];

function testProgram() {
  const [image, commands] = program(
    events
      .inputText('Логин', 'Админ')
      .inputText('Пароль', 'admin')
      .check('Запомнить')
      .click('Войти'),
    queries
      .getAllUsers([{ name: 'Vasiliy' }, { name: 'Fedor' }])
      .isAllowedToEnter(true)
  );

  expect(image).toMatchImageSnapshot();

  // Снимок экрана и его сравнение с прошлой версией (при наличии)

  expect(commands).toMatchCommandsSnapshot();

  // login: [{ login: 'Админ', password: 'admin', remember: true }]
}

declare function expect(input: unknown): {
  toMatchImageSnapshot(): unknown;
  toMatchCommandsSnapshot(): unknown;
};

type Queries = {
  getAllUsers(a: unknown): Queries;
  isAllowedToEnter(a: unknown): Queries;
};

declare const queries: Queries;

type Events = {
  inputText(a: string, b: string): Events;
  check(a: string): Events;
  click(a: string): Events;
};

declare const events: Events;

type Images = {};
type Commands = {};
