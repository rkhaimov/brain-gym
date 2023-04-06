main();

async function main() {

}

function divide(n: number, by: number): Either<void, number> {
  if (by === 0) {
    return { type: 'left', value: undefined };
  }

  return { type: 'right', value: n / by };
}

type Either<TLeft, TRight> =
  | { type: 'left'; value: TLeft }
  | { type: 'right'; value: TRight };
