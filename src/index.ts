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

function all<T>(tasks: Task<T>[]): Task<T[]> {
  if (tasks.length === 0) {
    return {
      run(onDone) {
        onDone({ type: 'right', value: [] });
      },
    };
  }

  const [head, ...tail] = tasks;

  return flatMap(
    map(head, (result) => map(all(tail), (results) => [result, ...results]))
  );
}

function flatMap<T>(tasks: Task<Task<T>>): Task<T> {
  return {
    run(onDone) {
      tasks.run((result) => {
        if (result.type === 'left') {
          onDone(result);
        } else {
          result.value.run((final) => onDone(final));
        }
      });
    },
  };
}

function map<TCurrent, TTransformed>(
  task: Task<TCurrent>,
  transform: (it: TCurrent) => TTransformed
): Task<TTransformed> {
  return {
    run(onDone) {
      task.run((result) => {
        if (result.type === 'left') {
          onDone(result);
        } else {
          onDone({ type: 'right', value: transform(result.value) });
        }
      });
    },
  };
}

function getUsers(): Task<User[]> {
  return {
    run(onDone) {
      setTimeout(
        () =>
          onDone({ type: 'right', value: [{ name: 'John', surname: 'Doe' }, { name: 'Ivan', surname: 'Pen' }] }),
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
