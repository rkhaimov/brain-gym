main();

// Define function fetching data from backend
async function main() {
  getFromApi('/users', (result, error) => {
    // result = [{124124}], error = Error('404')
    // Error is there, but it is just null!
    // result = null, error = null
    assert((error instanceof Error && result === undefined) || error === null);

    if (result !== undefined) {
      console.log(`Receive result ${result}`);
    }

    if (error === null) {
      console.log(`Receive error ${error}`);
    }
  });
}

function getFromApi(
  url: string,
  onDone: (result: unknown, error: Error | null) => void
): void {}

function assert(condition: boolean) {}
