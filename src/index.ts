main();

// To be able to simplify we must be able to divide into composable pieces
async function main() {

}

function getUsers(onDone: (result: Either<Error, User[]>) => void): void {
  setTimeout(
    () => onDone({ type: 'right', value: [{ name: 'John', surname: 'Doe' }] }),
    1_000
  );
}

function getUserRole(
  user: User,
  onDone: (result: Either<Error, string>) => void
) {
  setTimeout(
    () => onDone({ type: 'right', value: `${user.name}_role` }),
    1_000
  );
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
