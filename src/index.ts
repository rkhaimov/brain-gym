main();

// To be able to simplify we must be able to divide into composable pieces
async function main() {
  const sumM: Monoid<number> = {
    identity: () => 0,
    fold: (left, right) => left + right,
  };

  const concatM: Monoid<string> = {
    identity: () => '',
    fold: (left, right) => left + right,
  };

  console.log(foldElements(['Hello', ' ', 'World'], concatM));
}

function foldElements<T>(elements: T[], monoid: Monoid<T>): T {
  return elements.reduce(monoid.fold, monoid.identity());
}

type Monoid<in out T> = {
  identity(): T;
  fold(left: T, right: T): T;
};
