import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { lcs } from "./index";

describe("lcs", () => {
  test("returns no matches when both sequences are empty", () => {
    assert.deepEqual(lcs([], []), []);
  });

  test("returns no matches when one sequence is empty", () => {
    assert.deepEqual(lcs(["A", "B"], []), []);
    assert.deepEqual(lcs([], ["A", "B"]), []);
  });

  test("returns no matches when the sequences have no common values", () => {
    assert.deepEqual(lcs(["A", "B"], ["C", "D"]), []);
  });

  test("matches every item in identical sequences", () => {
    assert.deepEqual(lcs(["A", "B", "C"], ["A", "B", "C"]), [
      [0, 0],
      [1, 1],
      [2, 2],
    ]);
  });

  test("returns source and target indices for a longest common subsequence", () => {
    assert.deepEqual(lcs(["A", "B", "C", "B", "D"], ["B", "C", "D"]), [
      [1, 0],
      [2, 1],
      [4, 2],
    ]);
  });

  test("finds an optimal result when several longest subsequences exist", () => {
    const left = ["A", "B", "C", "D", "E"];
    const right = ["A", "C", "B", "D", "E"];

    const matches = lcs(left, right);

    assert.equal(matches.length, 4);
    assertValidMatches(left, right, matches);
  });

  test("handles repeated values without reusing or reordering indices", () => {
    const left = ["A", "A", "B", "A"];
    const right = ["A", "B", "A", "A"];

    const matches = lcs(left, right);

    assert.equal(matches.length, 3);
    assertValidMatches(left, right, matches);
  });
});

function assertValidMatches(
  left: unknown[],
  right: unknown[],
  matches: [number, number][],
): void {
  for (let index = 0; index < matches.length; index += 1) {
    const [leftIndex, rightIndex] = matches[index];

    assert.equal(left[leftIndex], right[rightIndex]);

    if (index > 0) {
      const [previousLeftIndex, previousRightIndex] = matches[index - 1];
      assert.ok(previousLeftIndex < leftIndex, "left indices must increase");
      assert.ok(previousRightIndex < rightIndex, "right indices must increase");
    }
  }
}
