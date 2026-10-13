type Edit =
  | {
      type: "insert" | "delete";
      index: number;
      value: unknown;
    }
  | { type: "replace"; index: number; oldValue: unknown; newValue: unknown }
  | { type: "keep"; sourceIndex: number; targetIndex: number; value: unknown };

export function ldistance(left: unknown[], right: unknown[]): Edit[] {
  const costs: number[][] = Array.from({ length: left.length + 1 }, () =>
    Array.from({ length: right.length + 1 }, () => 0),
  );

  for (let index = 0; index < costs.length; index++) {
    costs[index][right.length] = left.length - index;
  }

  for (let index = 0; index < costs[left.length].length; index++) {
    costs[left.length][index] = right.length - index;
  }

  for (let lindex = left.length - 1; lindex >= 0; lindex--) {
    for (let rindex = right.length - 1; rindex >= 0; rindex--) {
      if (left[lindex] === right[rindex]) {
        costs[lindex][rindex] = costs[lindex + 1][rindex + 1];
      } else {
        costs[lindex][rindex] =
          1 +
          Math.min(
            costs[lindex + 1][rindex + 1],
            costs[lindex][rindex + 1],
            costs[lindex + 1][rindex],
          );
      }
    }
  }

  const edits: Edit[] = [];

  let lindex = 0;
  let rindex = 0;

  while (lindex < left.length || rindex < right.length) {
    if (lindex >= left.length) {
      edits.push({
        type: "insert",
        value: right[rindex],
        index: rindex,
      });

      rindex += 1;
    } else if (rindex >= right.length) {
      edits.push({
        type: "delete",
        value: left[lindex],
        index: rindex,
      });

      lindex += 1;
    } else if (left[lindex] === right[rindex]) {
      edits.push({
        type: "keep",
        value: left[lindex],
        sourceIndex: lindex,
        targetIndex: rindex,
      });

      lindex += 1;
      rindex += 1;
    } else if (costs[lindex][rindex] > costs[lindex + 1][rindex + 1]) {
      edits.push({
        type: "replace",
        oldValue: left[lindex],
        newValue: right[rindex],
        index: rindex,
      });

      lindex += 1;
      rindex += 1;
    } else if (costs[lindex][rindex] > costs[lindex + 1][rindex]) {
      edits.push({
        type: "delete",
        value: left[lindex],
        index: rindex,
      });

      lindex += 1;
    } else {
      edits.push({
        type: "insert",
        value: right[rindex],
        index: rindex,
      });

      rindex += 1;
    }
  }

  return edits;
}
