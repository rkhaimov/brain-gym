type Bowl = 'I';
type Space = 'X';
type Game = Array<Bowl | Space>;
type Position = number;

const winning = new Map<string, boolean>();

const isWinningGame = (game: Game, myturn: boolean): boolean => {
  const winning = isWinningTurn(game);

  if (myturn && winning) {
    return true;
  }

  if (not(myturn) && winning) {
    return false;
  }

  if (myturn) {
    return allMoves(game).some((moved) => isWinningGame(moved, not(myturn)));
  }

  return allMoves(game).every((moved) => isWinningGame(moved, not(myturn)));
};

const isWinningTurn = (game: Game): boolean => {
  return allMoves(game).some(hasNoMoves);
};

const hasNoMoves = (game: Game): boolean => {
  return game.every(ch => not(ch.includes('I')));
};

const allMoves = (game: Game): Game[] => {
  return game
    .reduce(
      (games, _, position) => [
        ...games,
        ...concatGames(
          tryOneShotMove(position, game),
          tryTwoShotsMove(position, game)
        )
      ],
      [] as Game[]
    )
    .map(minimizeGame);
};

const tryOneShotMove = (position: Position, game: Game): Game => {
  if (isOneShotPossible(position, game)) {
    return oneShot(position, game);
  }

  return emptyGame();
};

const tryTwoShotsMove = (position: Position, game: Game): Game => {
  if (isTwoShotsPossible(position, game)) {
    return twoShots(position, game);
  }

  return emptyGame();
};

const isOneShotPossible = (position: Position, game: Game): boolean => {
  return isBowlAt(position, game);
};

const oneShot = (position: Position, game: Game): Game => {
  return shotBowlAt(position, game);
};

const isTwoShotsPossible = (position: Position, game: Game): boolean => {
  return (
    isOneShotPossible(position, game) &&
    isOneShotPossible(nextPositionFrom(position), game)
  );
};

const twoShots = (position: Position, game: Game): Game => {
  return oneShot(nextPositionFrom(position), oneShot(position, game));
};

const dematerialize = (game: string): Game =>
  game.split('').filter((ch): ch is Bowl | Space => ch === 'I' || ch === 'X');

const isBowlAt = (position: Position, game: Game): boolean =>
  game[position] === 'I';

const shotBowlAt = (position: Position, game: Game): Game => {
  return game.map((sign, index) => (position === index ? 'X' : sign));
};

const nextPositionFrom = (position: Position): Position => position + 1;

const emptyGame = (): Game => [];

const concatGames = (left: Game, right: Game): Game[] => {
  if (left.length === 0 && right.length === 0) {
    return [];
  }

  if (left.length === 0) {
    return [right];
  }

  if (right.length === 0) {
    return [left];
  }

  return [left, right];
};

const not = (cond: boolean): boolean => !cond;

const toResultString = (winning: boolean): string => (winning ? 'WIN' : 'LOSE');

const minimizeGame = (game: Game): Game => {
  return game;

  return dematerialize(
    materialize(game)
      .split(/X+/g)
      .filter((ch) => ch !== '')
      .sort((left, right) => left.length - right.length)
      .join('X')
  );
};

const materialize = (game: Game): string => game.join('');

// console.table(
//   range(0, 10)
//     .map((n) => 'I'.repeat(n))
//     .map(
//       (game) =>
//         [game, isWinningGame(minimizeGame(dematerialize(game)), true)] as const
//     )
//     .map(([game, won]) => {
//       console.log(won);
//       return won ? { win: game, lose: '-' } : { win: '-', lose: game };
//     })
// );

console.log(isWinningGame(minimizeGame(dematerialize('III')), true));
