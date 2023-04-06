main();

async function main() {
  getUsers((result) => {
    if (result.type === 'left') {
      console.log(`Receive error ${result.value.message}`);
    } else {
      const userWithRole: Array<[User, string]> = [];
      result.value.map(capitalizeUser).map(user => getUserRole(user, role => userWithRole.push()));
    }
  });
}

function capitalizeUser(user: User): User {
  return { name: user.name.toUpperCase(), surname: user.surname.toUpperCase() };
}

function getUsers(onDone: (result: Either<Error, User[]>) => void): void {}

function getUserRole(user: User, onDone: (result: Either<Error, string>) => void) {}

type User = {
  name: string;
  surname: string;
};

function assert(condition: boolean) {}

type Either<TLeft, TRight> =
  | { type: 'left'; value: TLeft }
  | { type: 'right'; value: TRight };
