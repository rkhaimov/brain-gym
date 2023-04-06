main();

// Define function fetching data from backend
async function main() {
  getFromApi('/users', (result) => {
    if (result.type === 'left') {
      console.log(`Receive error ${result.value.message}`);
    } else {
      console.log(`Receive result ${result.value}`);
    }
  });
}

function getFromApi(
  url: string,
  onDone: (result: Either<Error, unknown>) => void
): void {}

function assert(condition: boolean) {}

type Either<TLeft, TRight> =
  | { type: 'left'; value: TLeft }
  | { type: 'right'; value: TRight };
