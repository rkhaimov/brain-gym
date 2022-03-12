type Game = number[];
type Pile = Game[number];

const not = (cond: boolean): boolean => !cond;

const range = (from: number, to: number): number[] => {
  if (from === to) {
    return [];
  }

  return [from, ...range(from + 1, to)];
};

const isWinningGame = (game: Game): boolean => lsgn(game) !== 0;

const allMoves = (piles: Game): Game[] => {
  return piles
    .reduce(
      (accumulated, pile, index) => [
        ...accumulated,
        ...allMovesOnPile(pile).map((move) => [
          ...move,
          ...piles.slice(0, index),
          ...piles.slice(index + 1),
        ]),
      ],
      [] as Game[]
    )
    .map(minimize);
};

const allMovesOnPile = (pile: Pile): Game[] => {
  if (pile === 1) {
    return [[]];
  }

  if (pile === 2) {
    return [[pile - 1], []];
  }

  return [
    [pile - 2],
    [pile - 1],
    ...allDivisionsOff(pile - 1),
    ...allDivisionsOff(pile - 2),
  ];
};

const allDivisionsOff = (pile: Pile): Pile[][] => {
  return range(0, (pile - (pile % 2)) / 2).map((times) => [
    times + 1,
    pile - (times + 1),
  ]);
};

const toResultString = (winning: boolean): string => (winning ? 'WIN' : 'LOSE');

const one = new Set([1, 4, 8, 13, 16, 20, 26, 32, 37]);

const minimize = (piles: Game): Game => {
  return ungroup(piles.map((pile) => (one.has(pile) ? 1 : pile)).sort());
};

const ungroup = (piles: Game): Game => {
  if (piles.length < 4) {
    return piles;
  }

  const [a, b, c, d, ...tail] = piles;

  if (a === b && b === c && c === d) {
    return ungroup([c, d, ...tail]);
  }

  return [a, ...ungroup([b, c, d, ...tail])];
};

const dematerialize = (game: string): Game =>
  game
    .split(/X+/g)
    .filter((ch) => ch.includes('I'))
    .map((ch) => ch.length);

const materialize = (game: Game): string =>
  game.map((count) => 'I'.repeat(count)).join('X');

const lsgn = (piles: Game): number => {
  if (piles.length === 0) {
    return 0;
  }

  return piles.map(_sgn).reduce(xor);
};

const memo = new Map<number, number>();

const opt =
  (fn: typeof sgn): typeof sgn =>
  (pile) => {
    if (not(memo.has(pile))) {
      memo.set(pile, fn(pile));
    }

    return memo.get(pile)!;
  };

const sgn = (pile: Pile): number => {
  return mex(allMovesOnPile(pile).map(lsgn));
};

const _sgn = opt(sgn);

const xor = (a: number, b: number): number => a ^ b;

const mex = (ns: number[]): number => {
  if (ns.length === 0) {
    return 0;
  }

  const prepared = new Set(ns);
  const found = range(0, ns.length).find((n) => not(prepared.has(n)));

  if (found === undefined) {
    return Math.max(...ns) + 1;
  }

  return found;
};
