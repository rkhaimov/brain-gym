main();

// To be able to simplify we must be able to divide into composable pieces
async function main() {
  // Task<User>
  const capitalized = map(getUsers(), (it) => it.map(capitalizeUser));

  // Task< Array< Task< string > > >
  const usersWithRoles = map(capitalized, (it) => it.map(getRoleByUser));

  // Task< Task< Array< string > > >
  const allUserWithRolesTask = map(usersWithRoles, (tasks) => all(tasks));

  // Task< Array< string > >
  const result = flatMap(allUserWithRolesTask);

  result.run((result) => {
    console.log(result);
  });
}

type Task<T> = {
  run(onDone: (result: Either<Error, T>) => void): void;
};

function all<T>(tasks: Task<T>[]): Task<T[]> {}

function flatMap<T>(tasks: Task<Task<T>>): Task<T> {}

function map<TCurrent, TTransformed>(
  task: Task<TCurrent>,
  transform: (it: TCurrent) => TTransformed
): Task<TTransformed> {}

function getUsers(): Task<User[]> {
  return {
    run(onDone) {
      setTimeout(
        () =>
          onDone({ type: 'right', value: [{ name: 'John', surname: 'Doe' }] }),
        1_000
      );
    },
  };
}

function getRoleByUser(user: User): Task<string> {
  return {
    run(onDone) {
      return setTimeout(
        () => onDone({ type: 'right', value: `${user.name}_role` }),
        1_000
      );
    },
  };
}

function capitalizeUser(user: User): User {
  return { name: user.name.toUpperCase(), surname: user.surname.toUpperCase() };
}

type User = {
  name: string;
  surname: string;
};

type Either<TLeft, TRight> =
  | { type: 'left'; value: TLeft }
  | { type: 'right'; value: TRight };
