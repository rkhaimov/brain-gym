type Pair<TFirst, TSecond> = <TResult extends TFirst | TSecond>(
  select: (first: TFirst, second: TSecond) => TResult
) => TResult;

const createPair =
  <TFirst, TSecond>(first: TFirst, second: TSecond): Pair<TFirst, TSecond> =>
  (select) =>
    select(first, second);

const first = <TFirst, TSecond>(first: TFirst, second: TSecond) => first;

const second = <TFirst, TSecond>(first: TFirst, second: TSecond) => second;

const pair = createPair('ONE', 'TWO');

console.log(pair(second));
