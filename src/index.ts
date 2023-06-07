type Cash = {
  weight: number;
  value: number;
  tag: string;
};

type Talk = {
  words: string;
  tag: number;
};

function act(input: Cash | Talk) {}
