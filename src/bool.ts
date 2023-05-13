type Branches<TTrue, TFalse> = <TResult>(
  predicate: (onTrue: TTrue, onFalse: TFalse) => TResult
) => TResult;

interface Flag {
  <TTrue, TFalse>(onTrue: TTrue, onFalse: TFalse): TTrue | TFalse;
}

const createBranches =
  <TTrue, TFalse>(onTrue: TTrue, onFalse: TFalse): Branches<TTrue, TFalse> =>
  (predicate) =>
    predicate(onTrue, onFalse);

const swap = <TTrue, TFalse>(
  branches: Branches<TTrue, TFalse>
): Branches<TFalse, TTrue> =>
  branches((onTrue, onFalse) => createBranches(onFalse, onTrue));

const isTrue: Flag = (onTrue, onFalse) => onTrue;

const isFalse: Flag = (onTrue, onFalse) => onFalse;

const not = (flag: Flag) => flag(isFalse, isTrue);

const and = (left: Flag, right: Flag) => left(right, isFalse);

const or = (left: Flag, right: Flag) => left(isTrue, right);

const isGay = createBranches('YES', 'NO');

console.log(isGay(not(isTrue)));
