type Exact = {
  kind: 'exact';
  char: string;
};

type Not = {
  kind: 'not';
  chars: Set<string>;
};

type Never = {
  kind: 'never';
};

type CharGuess = Exact | Not | Never;
type WordGuess = Map<number, CharGuess>;

function createGuess(word: string, matches: number): WordGuess[] {
  const permuted = permutations(word.length, matches);

  return permuted.map((permutation): WordGuess => {
    const exacts = permutation.map((index): [number, Exact] => [
      index,
      createExact(word[index]),
    ]);

    const nots = subtract(numerical(word), permutation).map(
      (index): [number, Not] => [index, createNot(word[index])]
    );

    return new Map<number, CharGuess>([...exacts, ...nots]);
  });
}

function predictMany(words: WordGuess[][]): WordGuess[] {
  if (words.length === 0) {
    return [];
  }

  if (words.length === 1) {
    return words[0];
  }

  const [left, ...tail] = words;

  return predict(left, predictMany(tail));
}

function predict(left: WordGuess[], right: WordGuess[]): WordGuess[] {
  return left
    .flatMap((lword) =>
      right.map((rword): [WordGuess, WordGuess] => [lword, rword])
    )
    .map(([lword, rword]) => combineWords(lword, rword))
    .filter((word) => isNeverWord(word) === false);
}

function isNeverWord(left: WordGuess): boolean {
  return [...left.values()].some((char) => char.kind === 'never');
}

function combineWords(left: WordGuess, right: WordGuess): WordGuess {
  return new Map(
    [...left.entries()].map(([lindex, lchar]): [number, CharGuess] => [
      lindex,
      combineChars(lchar, right.get(lindex) as CharGuess),
    ])
  );
}

function suits(word: string, guesses: WordGuess[]): boolean {
  return guesses.some((guess) =>
    [...guess.entries()].every(([index, char]) => {
      if (char.kind === 'exact') {
        return char.char === word[index];
      }

      if (char.kind === 'not') {
        return char.chars.has(word[index]) === false;
      }

      return false;
    })
  );
}

function combineChars(left: CharGuess, right: CharGuess): CharGuess {
  if (left.kind === 'never' || right.kind === 'never') {
    return createNever();
  }

  if (left.kind === 'exact' && right.kind === 'exact') {
    return mergeExact(left, right);
  }

  if (left.kind === 'not' && right.kind === 'not') {
    return mergeNot(left, right);
  }

  if (left.kind === 'not' && right.kind === 'exact') {
    return mergeExactAndNot(right, left);
  }

  assert(left.kind === 'exact' && right.kind === 'not');

  return mergeExactAndNot(left, right);
}

function createExact(char: string): Exact {
  return { char, kind: 'exact' };
}

function mergeExact(left: Exact, right: Exact): Exact | Never {
  return left.char === right.char ? left : createNever();
}

function createNot(char: string): Not {
  return { kind: 'not', chars: new Set(char) };
}

function mergeNot(left: Not, right: Not): Not {
  return { ...left, chars: new Set([...left.chars, ...right.chars]) };
}

function wordsToString(words: WordGuess[]): string {
  return words.map(wordToString).join('\n');
}

function wordToString(word: WordGuess): string {
  return [...word.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, char]) => {
      if (char.kind === 'not') {
        return notToString(char);
      }

      if (char.kind === 'exact') {
        return exactToString(char);
      }

      return neverToString(char);
    })
    .join(' | ');
}

function notToString(char: Not): string {
  return `not: ${[...char.chars].join(', ')}`;
}

function exactToString(char: Exact): string {
  return `exact: ${char.char}`;
}

function neverToString(char: Never): string {
  return 'never';
}

function createNever(): Never {
  return { kind: 'never' };
}

function mergeExactAndNot(left: Exact, right: Not): Exact | Never {
  if (right.chars.has(left.char)) {
    return createNever();
  }

  return left;
}

function assert<T>(condition: T): asserts condition {
  if (condition) {
    return;
  }

  throw new Error();
}

function numerical(word: string): number[] {
  return new Array(word.length).fill(null).map((_, index) => index);
}

function subtract(all: number[], ns: number[]): number[] {
  return all.filter((element) => ns.includes(element) === false);
}

function permutations(n: number, places: number): number[][] {
  if (places === 0) {
    return [];
  }

  if (places === 1) {
    return range(n).map((index) => [index]);
  }

  const prev = permutations(n, places - 1);

  return prev.flatMap((permutation): number[][] =>
    range(n)
      .slice(permutation[permutation.length - 1] + 1)
      .map((unvisited) => [...permutation, unvisited])
  );
}

function range(n: number): number[] {
  return new Array(n).fill(null).map((_, index) => index);
}

const t_0 = createGuess('osmundine', 5);

const guess = predictMany([t_0]);

console.log(guess.length);
console.log(wordsToString(guess));
console.log(suits('organzine', guess));
