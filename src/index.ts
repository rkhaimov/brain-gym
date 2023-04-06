main();

// Define function fetching data from backend
async function main() {
  getUsers((result) => {
    if (result.type === 'left') {
      console.log(`Receive error ${result.value.message}`);
    } else {
      console.log(`Receive result ${result.value}`);
    }
  });
}

function capitalizeUser(user: User): User {
  return { name: user.name.toUpperCase(), surname: user.surname.toUpperCase() };
}

function getUsers(onDone: (result: Either<Error, User[]>) => void): void {}

type User = {
  name: string;
  surname: string;
};

function assert(condition: boolean) {}

type Either<TLeft, TRight> =
  | { type: 'left'; value: TLeft }
  | { type: 'right'; value: TRight };
