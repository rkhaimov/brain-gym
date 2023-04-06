main();

async function main() {
  console.log(head([]));
  console.log(head([{ type: 'left', value: undefined }]));
}

// T | Error != a + 1 (Might have intersection)
// Either<void, T> = a + 1;
function head<T>(elements: T[]): Either<void, T> {
  if (elements.length === 0) {
    return { type: 'left', value: undefined };
  }

  return { type: 'right', value: elements[0] };
}

type Either<TLeft, TRight> =
  | { type: 'left'; value: TLeft }
  | { type: 'right'; value: TRight };
