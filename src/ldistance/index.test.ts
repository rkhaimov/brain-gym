import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { ldistance } from "./index";

describe("ldistance", () => {
  test("returns no edits when both sequences are empty", () => {
    assert.deepEqual(ldistance([], []), []);
  });

  test("keeps a value that is present in both sequences", () => {
    assert.deepEqual(ldistance(["A"], ["A"]), [
      { type: "keep", sourceIndex: 0, targetIndex: 0, value: "A" },
    ]);
  });

  test("inserts a value into an empty sequence", () => {
    assert.deepEqual(ldistance([], ["A"]), [
      { type: "insert", index: 0, value: "A" },
    ]);
  });

  test("deletes the only value from a sequence", () => {
    assert.deepEqual(ldistance(["A"], []), [
      { type: "delete", index: 0, value: "A" },
    ]);
  });

  test("replaces one value with another", () => {
    assert.deepEqual(ldistance(["A"], ["B"]), [
      { type: "replace", index: 0, oldValue: "A", newValue: "B" },
    ]);
  });

  test("keeps every value in identical sequences", () => {
    const sequence = ["A", "B", "C"];

    assert.deepEqual(ldistance(sequence, sequence), [
      { type: "keep", sourceIndex: 0, targetIndex: 0, value: "A" },
      { type: "keep", sourceIndex: 1, targetIndex: 1, value: "B" },
      { type: "keep", sourceIndex: 2, targetIndex: 2, value: "C" },
    ]);
  });

  test("inserts values around values that are kept", () => {
    const left = ["B", "D"];
    const right = ["A", "B", "C", "D"];

    assert.deepEqual(ldistance(left, right), [
      { type: "insert", index: 0, value: "A" },
      { type: "keep", sourceIndex: 0, targetIndex: 1, value: "B" },
      { type: "insert", index: 2, value: "C" },
      { type: "keep", sourceIndex: 1, targetIndex: 3, value: "D" },
    ]);
  });

  test("deletes values around values that are kept", () => {
    const left = ["A", "B", "C", "D"];
    const right = ["B", "D"];

    assert.deepEqual(ldistance(left, right), [
      { type: "delete", index: 0, value: "A" },
      { type: "keep", sourceIndex: 1, targetIndex: 0, value: "B" },
      { type: "delete", index: 1, value: "C" },
      { type: "keep", sourceIndex: 3, targetIndex: 1, value: "D" },
    ]);
  });

  test("combines edit types into a minimum edit script", () => {
    const left = [..."kitten"];
    const right = [..."sitting"];

    assert.deepEqual(ldistance(left, right), [
      { type: "replace", index: 0, oldValue: "k", newValue: "s" },
      { type: "keep", sourceIndex: 1, targetIndex: 1, value: "i" },
      { type: "keep", sourceIndex: 2, targetIndex: 2, value: "t" },
      { type: "keep", sourceIndex: 3, targetIndex: 3, value: "t" },
      { type: "replace", index: 4, oldValue: "e", newValue: "i" },
      { type: "keep", sourceIndex: 5, targetIndex: 5, value: "n" },
      { type: "insert", index: 6, value: "g" },
    ]);
  });

  test("uses replacements when preserving a common subsequence costs more", () => {
    const left = ["A", "B", "C"];
    const right = ["C", "B", "A"];

    assert.deepEqual(ldistance(left, right), [
      { type: "replace", index: 0, oldValue: "A", newValue: "C" },
      { type: "keep", sourceIndex: 1, targetIndex: 1, value: "B" },
      { type: "replace", index: 2, oldValue: "C", newValue: "A" },
    ]);
  });

  test("handles repeated values", () => {
    const left = ["A", "A", "B"];
    const right = ["A", "B", "A"];

    assert.deepEqual(ldistance(left, right), [
      { type: "keep", sourceIndex: 0, targetIndex: 0, value: "A" },
      { type: "replace", index: 1, oldValue: "A", newValue: "B" },
      { type: "replace", index: 2, oldValue: "B", newValue: "A" },
    ]);
  });

  test("treats undefined as a sequence value", () => {
    const left = [undefined];
    const right = ["A"];

    assert.deepEqual(ldistance(left, right), [
      { type: "replace", index: 0, oldValue: undefined, newValue: "A" },
    ]);
  });

  test("inserts undefined into an empty sequence", () => {
    assert.deepEqual(ldistance([], [undefined]), [
      { type: "insert", index: 0, value: undefined },
    ]);
  });

  test("deletes undefined from a sequence", () => {
    assert.deepEqual(ldistance([undefined], []), [
      { type: "delete", index: 0, value: undefined },
    ]);
  });

  test("uses the current index when deleting after an insertion", () => {
    const left = ["A", "C", "D", "X"];
    const right = ["B", "A", "C", "D"];

    assert.deepEqual(ldistance(left, right), [
      { type: "insert", index: 0, value: "B" },
      { type: "keep", sourceIndex: 0, targetIndex: 1, value: "A" },
      { type: "keep", sourceIndex: 1, targetIndex: 2, value: "C" },
      { type: "keep", sourceIndex: 2, targetIndex: 3, value: "D" },
      { type: "delete", index: 4, value: "X" },
    ]);
  });

  test("uses the current index when replacing after an insertion", () => {
    const left = ["A"];
    const right = ["B", "B"];

    assert.deepEqual(ldistance(left, right), [
      { type: "replace", oldValue: "A", newValue: "B", index: 0 },
      { type: "insert", value: "B", index: 1 },
    ]);
  });

  test("chooses operations using the total remaining cost", () => {
    const left = ["A", "A"];
    const right = ["B", "A", "A"];

    assert.deepEqual(ldistance(left, right), [
      { type: "insert", index: 0, value: "B" },
      { type: "keep", sourceIndex: 0, targetIndex: 1, value: "A" },
      { type: "keep", sourceIndex: 1, targetIndex: 2, value: "A" },
    ]);
  });
});
