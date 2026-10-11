type Point = [number, number];

type Match = Point[];

export function lcs(left: unknown[], right: unknown[]): Match {
  const grid = Array.from({ length: left.length + 1 }, () =>
    Array.from({ length: right.length + 1 }, () => 0),
  );

  for (let lindex = left.length - 1; lindex >= 0; lindex--) {
    for (let rindex = right.length - 1; rindex >= 0; rindex--) {
      if (left[lindex] === right[rindex]) {
        grid[lindex][rindex] = 1 + grid[lindex + 1][rindex + 1];
      } else {
        grid[lindex][rindex] = Math.max(
          grid[lindex + 1][rindex],
          grid[lindex][rindex + 1],
        );
      }
    }
  }

  const match: Match = [];

  let lindex = 0;
  let rindex = 0;

  while (lindex < left.length && rindex < right.length) {
    if (left[lindex] === right[rindex]) {
      match.push([lindex, rindex]);

      lindex += 1;
      rindex += 1;
    } else if (grid[lindex + 1][rindex] >= grid[lindex][rindex + 1]) {
      lindex += 1;
    } else {
      rindex += 1;
    }
  }

  return match;
}
