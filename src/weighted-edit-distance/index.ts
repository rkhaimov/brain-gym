export type WeightedEdit<T> =
  | { type: "insert"; index: number; value: T }
  | { type: "delete"; index: number; value: T }
  | { type: "replace"; index: number; oldValue: T; newValue: T }
  | {
      type: "keep";
      sourceIndex: number;
      targetIndex: number;
      value: T;
    };

export type EditCosts<T> = {
  insert: (value: T) => number;
  delete: (value: T) => number;
  replace: (oldValue: T, newValue: T) => number;
};

export type WeightedEditDistanceResult<T> = {
  cost: number;
  edits: WeightedEdit<T>[];
};

export function weightedEditDistance<T>(
  left: readonly T[],
  right: readonly T[],
  editCosts: EditCosts<T>,
): WeightedEditDistanceResult<T> {
  const costs: number[][] = Array.from({ length: left.length + 1 }, () =>
    Array.from({ length: right.length + 1 }, () => 0),
  );

  for (let index = left.length - 1; index >= 0; index--) {
    costs[index][right.length] =
      editCosts.delete(left[index]) + costs[index + 1][right.length];
  }

  for (let index = right.length - 1; index >= 0; index--) {
    costs[left.length][index] =
      editCosts.insert(right[index]) + costs[left.length][index + 1];
  }

  for (let lindex = left.length - 1; lindex >= 0; lindex--) {
    for (let rindex = right.length - 1; rindex >= 0; rindex--) {
      if (left[lindex] === right[rindex]) {
        costs[lindex][rindex] = costs[lindex + 1][rindex + 1];
      } else {
        const replaced =
          editCosts.replace(left[lindex], right[rindex]) +
          costs[lindex + 1][rindex + 1];

        const inserted =
          editCosts.insert(right[rindex]) + costs[lindex][rindex + 1];

        const deleted =
          editCosts.delete(left[lindex]) + costs[lindex + 1][rindex];

        costs[lindex][rindex] = Math.min(replaced, inserted, deleted);
      }
    }
  }

  const edits: WeightedEdit<T>[] = [];

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
    } else {
      const replaced =
        editCosts.replace(left[lindex], right[rindex]) +
        costs[lindex + 1][rindex + 1];

      const inserted =
        editCosts.insert(right[rindex]) + costs[lindex][rindex + 1];

      const deleted =
        editCosts.delete(left[lindex]) + costs[lindex + 1][rindex];

      const best = Math.min(replaced, inserted, deleted);

      if (best === replaced) {
        edits.push({
          type: "replace",
          oldValue: left[lindex],
          newValue: right[rindex],
          index: rindex,
        });

        lindex += 1;
        rindex += 1;
      } else if (best === deleted) {
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
  }

  return {
    cost: costs[0][0],
    edits,
  };
}
